var treeCount;
var gmarkers = [];
var markers = [];
var image = 'https://marldonchristmastrees.co.uk/wp-content/themes/Marldon2018/assets/icons/mapmarker.png';
var map

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

    //Find how many trees we have so we can allocate
    tree_db.allDocs().then(function(result){
        for(var j=0; j<result.total_rows; j++) {
            tree_db.get(result.rows[j].id).then(function(doc) {
                var tempPos = {lat: doc.location.lat, lng: doc.location.long}
                markers.push(tempPos);
                //Finished, let's fetch.
                AddMarkers();
            });
        }
    });

}

function AddMarkers() {
    //Loop through all markers and add to map
    for(var i=0; i<markers.length; i++) {
        console.log(markers[i]);
        var tempPos = { lat: parseFloat(markers[i].lat), lng: parseFloat(markers[i].lng)}
        var tempMarker = new google.maps.Marker({
            position: tempPos,
            map: map,
            icon: image
        });

        gmarkers.push(tempMarker);
    }
}





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
    //remove tilt for birdseye
    map.setTilt(0);
    //Custom map marker


    UpdateMarkers();
}
