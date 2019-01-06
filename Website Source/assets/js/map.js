var gmarkers = [];
var trees = [];
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

    //Add Markers
    UpdateMarkers();
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
            result = JSON.parse(result);

            //Store customers in an array
            var customers = [];

            for(var i=0; i<result.length; i++) {
                //AddMarker(result[i]);
                console.log(result);

                //Store in customer array
                customers.push(result[i].customer, result[i].tree);
            }
        }
    });



}

function AddMarkers(custDoc, custTreeDoc) {
    //Create marker from doc
    var tempPos = {lat: parseFloat(custTreeDoc.location.lat), lng: parseFloat(custTreeDoc.location.long)};
    var tempMarker = new google.maps.Marker({
        position: tempPos,
        map: map,
        icon: image
    });

    //Store the marker in an array in case we need to clear
    gmarkers.push(tempMarker);

    var contentString;



        //Now we've added the marker, we need to get the customer's details and add it to the marker
        var tempTree = trees[i]
        var customerID = tempTree.customer_id;
        var customerDoc = customer_db.get(customerID);

        //Loop through customer, get content to put in infopanel
        customerDoc.then(function(customer){

            //Store customer in an array
            customers.push(customer);

            //Store customers in localstorage so we don't have to reaccess database
            localStorage.setItem("customers", JSON.stringify(customers));


            //Try catch, in case DB fetch fails.
            try {
                //Content for infowindow
                contentString = '<div id="content-user-'+ customerID +'">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h5 id="firstHeading" class="firstHeading">'+customer.first_name +" " + customer.last_name+'</h5>'+
                '<div id="bodyContent">'+
                '<p class="livemap-head"><strong>'+customer.email+'</strong></p>'+
                '<p class="m-0 livemap-head"><strong>Customer Collection Date:</strong> '+tempTree.shipping_date+'</p>'+
                '<p class="m-0 livemap-head"><strong>Tree Cutting Date: </strong>' +tempTree.cutting_info.cut_date+'</p>'+
                '<p class="m-0 livemap-head"><strong>Tree ID: </strong>'+tempTree.tree.id+'</p>'+
                '<p class="m-0 livemap-head"><strong>Species: </strong>'+tempTree.tree.species+'</p>'+
                '<p class="m-0 livemap-head"><strong>Size: </strong>'+tempTree.tree.size+'ft</p>'+
                '<p class="m-0 livemap-head"><strong>Label Colour: </strong>'+tempTree.tree.label_colour+'</p>';

                if(customer.delivery == 1) {
                     contentString += '<p class="m-1 livemap-head"><strong>Address line 1: </strong>' + customer.addr1;

                     if(customer.addr2 != "" || customer.addr2 != null) {
                         contentString +='<strong>Address line 2: </strong>' + customer.addr2;
                     }
                     contentString += '<strong>Town: </strong>' + customer.town +
                     '<strong>Postcode: </strong>' + customer.postcode +
                     '</p>'
                 }
                 else {
                     contentString += '<p class="m-1"><strong>Customer has opted to COLLECT</strong></p>';
                 }

                 contentString += '<a id="userid-'+customerID+'" class="btn btn-primary" onclick="ReplaceInfoWindow(this)">Edit</a>' +
                 '</div>'+
                 '</div>';
            }
            catch(ex) {
                console.log("And error occured. Error was " + ex);
                console.log("Debugging:");
                console.log(customer);
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

        }); //End .then()

    }
}

function ReplaceInfoWindow(btn) {
    //Find out which edit button was pressed
    var user = btn.id;
    var id = user.replace('userid-', '');
    localStorage.setItem("last_edited_id", id);


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
    form.appendChild(submitBtn);
    infoWindowContainer.append(form);
    infoWindowContainer.innerHTML+='</div>';
}

function DoLogin() {
    //Get container ID from storage
        var id = localStorage.getItem('last_edited_id');
        var elemId = localStorage.getItem('containerid');
        infoWindowContainer = document.getElementById(elemId);

        //Create alert element
        var alert = document.createElement('div');
        var form = document.getElementById('cyo-livemap-login');

        //Get submitted user ID
        var submittedID = $('input[name="userID"]').val();
        console.log("ajax request yo");
        //ajax to check login correct
        $.ajax({
            url: "http://localhost:9000/login",
            type: "post",
            data: {"loginCode": submittedID},
            success: function(result) {
                console.log(result);
                console.log(JSON.parse(result));

                //Parse the stringified JSON response
                result = JSON.parse(result);
                switch(result.status) {
                    case "success":
                    break;

                    case "error":
                    break;
                }
            }
        });
}
