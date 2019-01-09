var gmarkers    = [];
var trees       = [];
var customers   = [];
var image = 'https://marldonchristmastrees.co.uk/wp-content/themes/Marldon2018/assets/icons/mapmarker.png';
var map



//Initialise google map
function initMap() {
    //Location to center on
    var treeFarmLoc = { lat: 50.453191, lng: -3.6 };
    map = new google.maps.Map(document.getElementById('livemap'), {
        //Initialise map params
        zoom: 18,
        center: treeFarmLoc,
        mapTypeId: 'satellite'
    });

    //Remove tilt for birdseye
    map.setTilt(0);

    map.addListener('click', function(e) {
        placeMarker(e.latLng, map);
    });

    //Add Markers
    UpdateMarkers();
}

function placeMarker(position, map) {
    //Check that users have enabled adding markers
    var addMarkerEnabled = $('#myonoffswitch:checked').val();
    if(addMarkerEnabled == "on" || addMarkerEnabled == "1") {
        //Open modal?
        $("#mapModal").modal("show");

        var lat = position.lat();
        var lng = position.lng();

        var newTreeLoc = {
            lat: lat,
            lng: lng
        }

        localStorage.setItem("newTreeLoc", JSON.stringify(newTreeLoc));

        console.log("lat: " + lat + "long: " + lng);

        //Append modal background inside map
        $('.modal-backdrop').appendTo('#mapWrap');

        //remove padding right and modal-open class
        $('body').removeClass();
        $('body').css("padding-right", "");

        console.log("open modal attempt");
        //Create Tree doc
        //Create Customer doc
        //Add marker

        //Center on new marker
        map.panTo(position);
    }

}

//Clear markers in to prepare for readding/updating
function ClearMarkers() {
    for(k=0; k<gmarkers.length; k++) {
        gmarkers[k].setMap(null);
    }
}

//Update markers when needed
function UpdateMarkers() {
    //Clear Markers
    ClearMarkers();

    //AJAX to get locations

    $.ajax({
        url: "http://localhost:9000/GetLocations",
        type: 'POST',
        success: function(result) {
            parsedResult = JSON.parse(result);

            for(var i=0; i<parsedResult.length; i++) {
                AddMarker(parsedResult[i].customer, parsedResult[i].tree);
            }
        }
    });
}

function AddMarker(custDoc, custTreeDoc) {
    //Create marker from doc
    var tempPos = {lat: parseFloat(custTreeDoc.location.lat), lng: parseFloat(custTreeDoc.location.long)};
    var tempMarker = new google.maps.Marker({
        position: tempPos,
        map: map,
        icon: image
    });

    //Store the marker in an array in case we need to clear
    gmarkers.push(tempMarker);


    //Store customer in an array
    customers.push(custDoc);
    trees.push(custTreeDoc);

    //Store customers and trees in localstorage so we don't have to reaccess database
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("trees", JSON.stringify(trees));

    var contentString;
    var customerID = custDoc._id;

    //Try catch, in case data passed to func is wrong
    try {
        //Content for infowindow
        contentString = '<div id="content-user-'+ customerID +'">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h5 id="firstHeading" class="firstHeading">'+custDoc.first_name +" " + custDoc.last_name+'</h5>'+
        '<div id="bodyContent">'+
        '<p class="livemap-head"><strong>'+custDoc.email+'</strong></p>'+
        '<p class="m-0 livemap-head"><strong>Customer Collection Date:</strong> '+custTreeDoc.shipping_date+'</p>'+
        '<p class="m-0 livemap-head"><strong>Tree Cutting Date: </strong>' +custTreeDoc.cutting_info.cut_date+'</p>'+
        '<p class="m-0 livemap-head"><strong>Tree ID: </strong>'+custTreeDoc.tree.id+'</p>'+
        '<p class="m-0 livemap-head"><strong>Species: </strong>'+custTreeDoc.tree.species+'</p>'+
        '<p class="m-0 livemap-head"><strong>Size: </strong>'+custTreeDoc.tree.size+'ft</p>'+
        '<p class="m-0 livemap-head"><strong>Label Colour: </strong>'+custTreeDoc.tree.label_colour+'</p>';
        if(custDoc.delivery == 1) {
             contentString += '<p class="m-1 livemap-head"><strong>Address line 1: </strong>' + custDoc.addr1;

             if(custDoc.addr2 != "" || custDoc.addr2 != null) {
                 contentString +='<strong>Address line 2: </strong>' + custDoc.addr2;
             }
             contentString += '<strong>Town: </strong>' + custDoc.town +
             '<strong>Postcode: </strong>' + custDoc.postcode +
             '</p>'
         }
         else {
             contentString += '<p class="m-1"><strong>Customer has opted to COLLECT</strong></p>';
         }

         contentString += '<a id="userid-'+customerID+'" class="btn btn-primary" onclick="ReplaceInfoWindow(this, '+custTreeDoc._id+')">Edit</a>' +
         '</div>'+
         '</div>';
    }
    catch(ex) {
        console.log("And error occured. Error was " + ex);
        console.log("Debugging:");
        console.log(custDoc);
        console.log(treeDoc);
    }

    //Create infowindow using content we just generated
    var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth:250
    }); //End Infowindow

    //Add an event listener for the marker to open the infowindow
    tempMarker.addListener('click', function(){
        infowindow.open(map, tempMarker);
    }); //End Event Listener
}

function ReplaceInfoWindow(btn, treeId) {
    //Find out which edit button was pressed
    var user = btn.id;
    var id = user.replace('userid-', '');
    localStorage.setItem("last_edited_id", id);
    localStorage.setItem("last_edited_tree", treeId);


    var elemId = "content-user-" + id;
    var infoWindowContainer = document.getElementById(elemId);
    localStorage.setItem("containerid", elemId);

    //Change InfoWindow to contain login form (title and container)
    infoWindowContainer.innerHTML='<div class="content-login-userid-'+id+'">'+
    '<h5>Login</h5>';

    //Create form
    var form = document.createElement('form');
    form.setAttribute('onsubmit', 'event.preventDefault();');


    //Create wrapper div (bootstrap's form-group class)
    var fg = document.createElement('div');
    fg.setAttribute('class', 'form-group fg-thin');

    //Create label for input
    var label = document.createElement('label');
    var labelText = document.createTextNode('User ID:');
    label.appendChild(labelText);
    label.setAttribute('for', 'userIDInput');

    //Create login input and add attributes
    var loginIDInput = document.createElement('input');
    loginIDInput.setAttribute('type', 'number');
    loginIDInput.setAttribute('placeholder', 'e.g. 2942');
    loginIDInput.setAttribute('name', 'userID');
    loginIDInput.setAttribute('id', 'userIDInput');
    loginIDInput.setAttribute('class', 'form-control');

    //Create Alert
    var alert = document.createElement('div');
    alert.setAttribute('id', 'alert');

    //Create submit button and add attributes
    var submitBtn = document.createElement('button');
    submitBtn.appendChild(document.createTextNode('Login'));
    submitBtn.setAttribute('type', 'button');
    submitBtn.setAttribute('id', 'login-submit-btn');
    submitBtn.setAttribute('class', 'btn btn-primary');
    submitBtn.setAttribute('onclick', 'DoLogin();');

    //Append everything to the relevant container
    form.appendChild(fg);
    fg.appendChild(label);
    fg.appendChild(loginIDInput);
    fg.appendChild(alert);
    form.appendChild(submitBtn);
    infoWindowContainer.append(form);
    infoWindowContainer.innerHTML+='</div>';
}

function DoLogin() {
    //Get container ID from storage
    var id = localStorage.getItem('last_edited_id');
    var elemId = localStorage.getItem('containerid');
    infoWindowContainer = document.getElementById(elemId);

    var alert = $('#alert');


    //Get submitted user ID
    var submittedID = $('input[name="userID"]').val();

    //ajax to check login correct
    $.ajax({
        url: "http://localhost:9000/login",
        type: "post",
        data: {"loginCode": submittedID},
        success: function(result) {
            //Parse the stringified JSON response
            result = JSON.parse(result);
            switch(result.status) {
                case "success":
                    alert.removeClass();
                    alert.addClass('alert alert-success');
                    alert.html('<strong>Success!</strong> Logging you in...');
                    localStorage.setItem("currUserPin", submittedID);
                    LoadEditForm(infoWindowContainer);
                break;

                case "error":
                    alert.removeClass();
                    alert.addClass('alert alert-danger');
                    alert.html('<strong>ERROR:</strong> ' + result.reason);
                break;
            }
        }
    });
}

function LoadEditForm(infoWindow) {
    var id = localStorage.getItem('last_edited_id');
    infoWindowContainer.innerHTML = '<div class="content-edit-userid-'+id+'">'+
    '<h5>Edit Tree</h5>';

    var customer;
    var treeInfo;

    //Get Customer details
    for(var i=0; i<customers.length; i++){
        var id = localStorage.getItem('last_edited_id');
        if(customers[i]._id = id) {
            customer = customers[i];
        }
    }

    //Get the relevant tree
    for(var i=0; i<trees.length; i++) {
        var treeId = localStorage.getItem('last_edited_tree');
        if(trees[i]._id = treeId) {
            treeInfo = trees[i];
        }
    }

    //Create form
    var form = document.createElement('form');

    //Create wrapper div (bootstrap's form-group class)
    var fg = document.createElement('div');
    fg.setAttribute('class', 'form-group fg-thin d-block');

    //Create label for input
    var label = document.createElement('label');
    var labelText = document.createTextNode('Customer Name:');
    label.appendChild(labelText);
    label.setAttribute('for', 'customerNameInput');

    //Create login input and add attributes
    var customerNameInput = document.createElement('input');
    customerNameInput.setAttribute('type', 'text');
    customerNameInput.setAttribute('readonly', true);
    customerNameInput.setAttribute('name', 'customerName');
    customerNameInput.setAttribute('id', 'customerName');
    customerNameInput.setAttribute('class', 'form-control');
    customerNameInput.setAttribute('value', customer.first_name + " " + customer.last_name);

    //Append customer Input to the relevant container
    form.appendChild(fg);
    fg.appendChild(label);
    fg.appendChild(customerNameInput);

    //Create Form Group for Collect Date Input
    var fg2 = document.createElement('div');
    fg2.setAttribute('class', 'form-group fg-thin d-block');

    //Label for Collect Date Field
    var collectDateLabel = document.createElement('label');
    var collectDateLabelText = document.createTextNode('Collection Date');
    collectDateLabel.appendChild(collectDateLabelText);
    collectDateLabel.setAttribute('for', 'collect_date');

    //Collect Date Input
    var collectDateWrap = document.createElement('div');
    collectDateWrap.setAttribute('class', 'input-group date');
    var collectDateInput = document.createElement('input');
    collectDateInput.setAttribute('type','text');
    collectDateInput.setAttribute('class', 'form-control');
    collectDateInput.setAttribute('id', 'collectDateInput');
    collectDateInput.setAttribute('value', treeInfo.shipping_date);
    var collectDateIconAppend = document.createElement('div');
    collectDateIconAppend.setAttribute('class', 'input-group-append');
    var collectDateSpan = document.createElement('span');
    collectDateSpan.setAttribute('class', 'input-group-text');
    var collectDateIcon = document.createElement('i');
    collectDateIcon.setAttribute('class', 'fa fa-calendar');

    //Append collect date input
    collectDateSpan.appendChild(collectDateIcon); //Append I to Span
    collectDateIconAppend.appendChild(collectDateSpan); //Append Span to Input Group Append
    collectDateWrap.appendChild(collectDateInput); //Append Input to Input group
    collectDateWrap.appendChild(collectDateIconAppend); //Append Append to Input Group
    fg2.appendChild(collectDateLabel);
    fg2.appendChild(collectDateWrap);
    form.appendChild(fg2);


    //Create form group for Cut Date
    var fg3 = document.createElement('div');
    fg3.setAttribute('class', 'form-group fg-thin d-block');

    //Label for Cut Date Field
    var cutDateLabel = document.createElement('label');
    var cutDateLabelText = document.createTextNode('Cutting Date');
    cutDateLabel.appendChild(cutDateLabelText);
    cutDateLabel.setAttribute('for', 'cut_date');

    //Cut Date input
    var cutDateWrap = document.createElement('div');
    cutDateWrap.setAttribute('class', 'input-group date');
    var cutDateInput = document.createElement('input');
    cutDateInput.setAttribute('type','text');
    cutDateInput.setAttribute('class', 'form-control');
    cutDateInput.setAttribute('id', 'cutDateInput');
    cutDateInput.setAttribute('value', treeInfo.cutting_info.cut_date);
    var cutDateIconAppend = document.createElement('div');
    cutDateIconAppend.setAttribute('class', 'input-group-append');
    var cutDateSpan = document.createElement('span');
    cutDateSpan.setAttribute('class', 'input-group-text');
    var cutDateIcon = document.createElement('i');
    cutDateIcon.setAttribute('class', 'fa fa-calendar');

    //Append cut date
    cutDateSpan.appendChild(cutDateIcon); //Append I to Span
    cutDateIconAppend.appendChild(cutDateSpan); //Append Span to Input Group Append
    cutDateWrap.appendChild(cutDateInput); //Append Input to Input group
    cutDateWrap.appendChild(cutDateIconAppend); //Append Append to Input Group
    fg3.appendChild(cutDateLabel);
    fg3.appendChild(cutDateWrap);
    form.appendChild(fg3);

    //Radio button section for cut trees
    //Create section label and assign class and text
    var radioGroupHeader = document.createElement('label');
    radioGroupHeader.appendChild(document.createTextNode('Has the tree been cut?'));
    radioGroupHeader.setAttribute('for', 'radio_cut');
    radioGroupHeader.setAttribute('class', 'd-block')

    //Create radio button wraps and set class
    var radioWrap = document.createElement('div');
    radioWrap.setAttribute('id', 'livemap-radio-wrap');
    radioWrap.setAttribute('class', 'd-block ml-1');

    //Wrapper for input and label
    var radioInline1 = document.createElement('div');
    var radioInline2 = document.createElement('div');
    radioInline1.setAttribute('class', 'form-check form-check-inline');
    radioInline2.setAttribute('class', 'form-check form-check-inline');

    //Create 2 new inputs  and their labels
    var radioInput1 = document.createElement('input');
    var radioInput2 = document.createElement('input');
    var radioLabel1 = document.createElement('label');
    var radioLabel2 = document.createElement('label');

    //Set label attributes and text node
    radioLabel1.setAttribute('class', 'form-check-label');
    radioLabel1.setAttribute('for','inlineRadio1');
    radioLabel1.appendChild(document.createTextNode('No'));

    radioLabel2.setAttribute('class', 'form-check-label');
    radioLabel2.setAttribute('for','inlineRadio2');
    radioLabel2.appendChild(document.createTextNode('Yes'));

    //Set attributes for first radio
    radioInput1.setAttribute('type', 'radio');
    radioInput1.setAttribute('class', 'form-check-input');
    radioInput1.setAttribute('name', 'radio_cut');
    radioInput1.setAttribute('id', 'inlineRadio1');
    radioInput1.setAttribute('value', '0');
    if(treeInfo.cutting_info.has_been_cut == 0) {
       radioInput1.setAttribute('checked', 'true');
    }

    //Set Attributes for second radio
    radioInput2.setAttribute('type', 'radio');
    radioInput2.setAttribute('class', 'form-check-input');
    radioInput2.setAttribute('name', 'radio_cut');
    radioInput2.setAttribute('id', 'inlineRadio2');
    radioInput2.setAttribute('value', '1');
    if(treeInfo.cutting_info.has_been_cut == 1) {
       radioInput2.setAttribute('checked', 'true');
    }

    //Append Radio button section
    var fg4 = document.createElement('div');
    fg4.setAttribute('class', 'form-group fg-thin d-block mr-auto');

    //Append radio buttons
    radioInline1.appendChild(radioInput1); //Append Radio Input to first inline wrapper
    radioInline1.appendChild(radioLabel1); //Append Label to first inline wrapper
    radioInline2.appendChild(radioInput2); //Append Radio Input to second inline wrapper
    radioInline2.appendChild(radioLabel2); //Append Label to second inline wrapper
    radioWrap.appendChild(radioInline1); //Append first inline wrapper
    radioWrap.appendChild(radioInline2); //Append second inline wrapper
    fg4.appendChild(radioGroupHeader); //Append section label to form group
    fg4.appendChild(radioWrap); //Append wrapped inputs to form group
    form.append(fg4); //Append form group to form

    //Create wrapper div for buttons and setup attributes
    var btnWrap = document.createElement('div');
    btnWrap.setAttribute('class', 'btn-toolbar');
    btnWrap.setAttribute('id', 'livemap-edit-btn-wrap');

    //Create apply changes button and setup attributes
    var applyBtn = document.createElement('button');
    applyBtn.setAttribute('class', 'btn btn-success btn-block');
    applyBtn.setAttribute('type', 'button');
    applyBtn.setAttribute('onclick', 'ApplyEdit('+treeInfo._id+');');
    applyBtn.appendChild(document.createTextNode('Apply Changes'));

    //Create remove button and setup attributes
    var removeBtn = document.createElement('button');
    removeBtn.setAttribute('class', 'btn btn-danger btn-block');
    removeBtn.setAttribute('type', 'button');
    removeBtn.setAttribute('onclick', 'RemoveTree('+treeInfo._id+');');
    removeBtn.appendChild(document.createTextNode('Remove Booking'));

    //Append buttons to wrapper div
    btnWrap.appendChild(applyBtn);
    btnWrap.appendChild(removeBtn);

    //Append button wrapper div to form
    form.appendChild(btnWrap);

    //Append form to InfoWindow and add closing div
    infoWindowContainer.append(form);
    infoWindowContainer.innerHTML+='</div>';

    //Set up both datepickers
    $('#collectDateInput').datepicker({
        format: "yyyy-mm-dd",
        defaultViewDate: {year: '2019'},
        maxViewMode: 1,
        todayBtn: true
    });

    $('#cutDateInput').datepicker({
        format: "yyyy-mm-dd",
        defaultViewDate: {year: '2019'},
        maxViewMode: 1,
        todayBtn: true
    });
}

function ApplyEdit(treeID) {
    if(isNaN(id)) {
        alert("Edits could not be applied. The ID passed to edit was not a number. This shouldn't be happening! Please clear your browser's cache and try again.");
    }
    else {
        //Grab values from the form
        var collectDate = $('collectDateInput').val();
        var cutDate = $('cutDateInput').val();
        var hasBeenCut = $('input[name="radio_cut"]:checked').val();

        $.ajax({
            url: "http://localhost:9000/LivemapApplyEdit",
            type: "POST",
            data: {"userID": userID, "treeID": treeID, "cutDate": cutDate, "collectDate": collectDate, "cut": hasBeenCut},
            success: function(result) {
                var response = JSON.parse(result);

                //Add alert element if doesn't exist
                var elemId = localStorage.getItem('containerid');
                infoWindowContainer = document.getElementById(elemId);

                var alert;
                if($(".alert").length > 0) {
                    //Grab the existing alert
                    alert = $(".alert");
                }
                else {
                    //Create the alert and insert
                    alert = document.createElement('div');
                    infoWindowContainer.childNodes[1].insertAdjacentElement('beforebegin', alert);
                }


                switch(response.status) {
                    case "success":
                        alert.setAttribute('class', 'alert alert-success');
                        alert.appendChild(document.createTextNode('Success! Information was successfully updated'));
                        break;

                    case "error":
                        alert.setAttribute('class', 'alert alert-danger');
                        alert.appendChild(document.createTextNode('ERROR: ' + response.reason));
                    break;
                }
            }
        });
    }
}

function RemoveTree(treeID) {
    //Confirm that user wishes to delete the booking
    if(confirm('Are you sure you wish to delete this booking?')) {

        var hasBeenCut = $('input[name="radio_cut"]:checked').val();
        //Can't delete if tree has been cut, display an error message
        if(hasBeenCut == 1) {
            //Add alert element if doesn't exist
            var elemId = localStorage.getItem('containerid');
            infoWindowContainer = document.getElementById(elemId);

            var alert;
            if($(".alert").length > 0) {
                //Grab the existing alert
                alert = $(".alert");
            }
            else {
                //Create the alert and insert
                alert = document.createElement('div');
                infoWindowContainer.childNodes[1].insertAdjacentElement('beforebegin', alert);
            }

        }
        else {
            //Ajax our request to delete!
            $.ajax({
                url: ajaxUrl + '?action=LivemapRemoveBooking',
                type: "POST",
                data: {"treeID": treeID},
                success: function(result) {
                    response = JSON.parse(result);

                    switch(response.status) {
                        case "success":
                            //Refresh Markers
                            UpdateMarkers();
                        break;

                        case "error":
                            alert.removeClass();
                            alert.addClass("alert alert-danger");
                            alert.html("ERROR: " + response.reason);
                        break;
                    }

                }
            });
        }
    }
    else{
        //Don't need to do anything in here yet...
    }
}

function AssignCustomer(exist) {
    var modalBody = $('.modal-body');
    modalBody.html();
    switch(exist) {
        case "exists":
        var selectOptions = "";

        //Create options for each customer, using their ID as the option value
        for(var i=0; i<customers.length; i++) {
            selectOptions += "<option value='"+customers[i]._id+"'>" + customers[i].first_name + " " + customers[i].last_name + "</option>";
        }
        modalBody.html("<div class='container-fluid'><h3>Assign Customer</h3><div class='row'><div class='form-group m-4 mx-auto w-50'><label for='customerAssignSelect'>Choose a customer:</label><select class='form-control' id='customerSelect'>"+selectOptions+"</select></div></div><div class='row'><button id='btn-continue' class='btn btn-success btn-block mx-auto' style='width:150px;' type='button'>Continue</button></div></div>")
        $('#btn-continue').click(function() {
            var custDoc;
            //Get customer doc from ajax then pass it to AddNewTree
            $.ajax({
                url: 'http://localhost:9000/GetCustomer',
                type: 'POST',
                data: {'custID': $("#customerSelect").val().toString()},
                success: function(result) {
                    response = JSON,parse(result);

                    switch(response.status) {
                        case "success":
                            custDoc = response.custDoc;
                        break;
                        case "error":
                            //Check if alert exists
                            if($('#errAlert').length == 0) {
                                $('.modal-body').prepend("<div id='errAlert' class='alert alert-danger'>" + response.reason + "</div>");
                            }
                            else {
                                //Update alert instead of prepend
                                $('#errAlert').text(response.reason);
                            }
                        break;
                    }
                }
            });

            AddNewTree(custDoc)
        })
        break;
        case "new":
            //Create new modal body
            var newContent = "<div class='form-group mx-auto w-75'><label for='first_name'>First Name:</label><input class='form-control' type='text' id='first_name' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='last_name'>Last Name:</label><input class='form-control' type='text' id='last_name' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='addr1'>Address Line 1:</label><input class='form-control' type='text' id='addr1' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='addr2'>Address Line 2:</label><input class='form-control' type='text' id='addr2'></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='email'>Email Address:</label><input class='form-control' type='text' id='email' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='postcode'>Postcode:</label><input class='form-control' type='text' id='postcode' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='town'>Town:</label><input type='text' class='form-control' id='town' required></div>";
            newContent += "<div class='switch-wrap w-100 d-block'><label>Deliver?</label><div class='onoffswitch mx-auto'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='delivery_check' ><label class='onoffswitch-label' for='delivery_check'><span class='deliveryswitch-inner onoffswitch-inner'></span><span class='onoffswitch-switch'></span></label></div></div>";
            newContent += "<div class='switch-wrap w-100 d-block'><label>Paid?</label><div class='onoffswitch mx-auto'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='paid_check' ><label class='onoffswitch-label' for='paid_check'><span class='deliveryswitch-inner onoffswitch-inner'></span><span class='onoffswitch-switch'></span></label></div></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='payment_date'>Payment Date:</label><div class='input-group date'><input type='text' class='form-control' required  id='payment_date'><div class='input-group-append'><span class='input-group-text'><i class='fa fa-calendar'></i></span></div></div></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='tree_cost'>Cost of Tree:</label><input class='form-control' type='number' id='tree_cost' step='0.01' required></div>";
            newContent += "<div class='form-group mx-auto w-75'><label for='deliver_cost'>Delivery Cost:</label><input class='form-control' type='number' id='delivery_cost' step='0.01' required></div>";
            newContent += "<button id='UploadCustBtn' class='btn btn-lg btn-success m-4' type='button'>Add Customer and Continue</button>";
             //Assign new content to modal body
            modalBody.html(newContent);

            $('#UploadCustBtn').click(function(){
                var total = parseFloat($('#tree_cost').val()) + parseFloat($('#delivery_cost').val());
                var first_name = $('#first_name').val();
                var last_name = $('#last_name').val();
                var addr1 = $('#addr1').val();
                var addr2 = $('#addr2').val();
                var town = $('#town').val();
                var postcode = $('#postcode').val();
                var email = $('#email').val();
                var delivery = $('#delivery_check:checked').val();
                var payment = {
                    paid: $('#paid_check:checked').val().toString(),
                    date: $('#payment_date').val().toString(),
                    tree_cost: $('#tree_cost').val().toString(),
                    delivery_cost:$('#delivery_cost').val().toString(),
                    total: total
                }

                var custDoc = {
                    "_id": (customers.length + 1).toString(),
                    "first_name": first_name.toString(),
                    "last_name": last_name.toString(),
                    "addr_1": addr1.toString(),
                    "addr_2": addr2.toString(),
                    "postcode": postcode.toString(),
                    "town": town.toString(),
                    "email": email.toString(),
                    "delivery": delivery.toString(),
                    "payment_info": payment
                }

                $.ajax({
                    url: 'http://localhost:9000/AddCustomer',
                    type: 'POST',
                    data: {'customer': custDoc},
                    success: function(result) {
                        response = JSON,parse(result);

                        switch(response.status) {
                            case "success":

                            break;
                            case "error":

                            break;
                        }
                    }
                });
            });
        break;
    }

}

function AddNewTree() {
    var customer = {
        id: $('#customerSelect').val(),
        name: $('#customerSelect').text()
    }
    var modalBody = $('.modal-body');

    //Clear Modal Body content
    modalBody.html('');


    //Build new modal body
    var newContent = "";
    newContent = "<div class='container-fluid'><h3>Tree Details</h3><div class='row'>";
    newContent += "<div class='form-group mx-auto w-75'><label for='customerName'>Customer Name:</label><input type='text' required class='form-control' id='customerNameInput' value='"+customer.name+"' readonly></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='tree_id'>Tree ID:</label><input class='form-control' type='number' required id='tree_id'></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='tree_size'>Tree Size:</label><input class='form-control' type='number' required id='tree_size' maxlength='2'></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='tree_species'>Species:</label><input class='form-control' type='text' required id='tree_species'></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='tree_labelCol'>Label Colour:</label><input class='form-control' type='number' required id='tree_labelCol'></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='shipDate'>Shipping/Collect Date:</label><div class='input-group date'><input type='text' class='form-control' required  id='shipDateInput'><div class='input-group-append'><span class='input-group-text'><i class='fa fa-calendar'></i></span></div></div></div>";
    newContent += "<div class='form-group mx-auto w-75'><label for='radio_cut'>Has the tree been cut?</label><div id='livemap-radio-wrap'><div class='form-check form-check-inline'><input type='radio' class='form-check-input' checked name='radio_cut' id='inlineRadio1' value='0'><label class='form-check-label' for='inlineRadio1'>No</label></div><div class='form-check form-check-inline'><input type='radio' class='form-check-input' name='radio_cut' id='inlineRadio2' value='1'><label class='form-check-label' for='inlineRadio2'>Yes</label></div></div></div>";
    newContent += "<button id='UploadTreeBtn' class='btn btn-lg btn-block btn-success m-4' type='button'>Add Tree</button>";
    modalBody.html(newContent);
    $('#shipDateInput').datepicker({
        format: "yyyy-mm-dd",
        defaultViewDate: {year: '2019'},
        maxViewMode: 1,
        todayBtn: true
    });


    $('#UploadTreeBtn').click(function(){
        //Create Tree Doc
        var treeDoc = {
            _id: trees.length+1, //Increment ID
            customer_id: custDoc._id.toString(),
            cutting_info: {
                cut_date: $('#shipDateInput').val().toString(),
                has_been_cut: $('input[name="radio_cut"]:checked').val()
            },
            shipping_date: $('shipDateInput').val().toString(),
            location: JSON.parse(localStorage.getItem("newTreeLoc")),
            tree: {
                size: $('#tree_size').val().toString(),
                species: $('#tree_species').val().toString(),
                label_colour:$('#tree_labelCol').val().toString(),
                id: $('#tree_id').val().toString()
            }
        }

        //Add the marker to map!
        AddMarker(custDoc, treeDoc);

    });



}
