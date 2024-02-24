/*jshint esversion: 9 */
/* global console*/
/* global L*/
/* global map */

/* global alert*/
function getData(url = '') {
    // Default options are marked with *
    return fetch(url)
        .then(response => response.json()); // parses JSON response into native JavaScript objects
}

const busIcon = L.divIcon({
    className: 'bus-icon',
    iconSize: [32, 32], // Set the size of the icon
});

// Add the bus marker with the custom divIcon
const busMarker = L.marker([0, 0], {icon: busIcon}).addTo(map);
busMarker.id = 'bus';
let trail;

function showRoute(stages, allPoints, busId) {
    "use strict";
    map.eachLayer(function (layer) {
        // Check if the layer is a marker
        if (layer instanceof L.Marker && layer.id !== 'bus') {
            // Remove the marker from the map
            map.removeLayer(layer);
        } else if (layer instanceof L.Polyline) {
            // Remove the polyline from the map
            map.removeLayer(layer);
        }
    });
    trail=L.polyline([], {color: 'red', weight: 4}).addTo(map);
    console.log(stages, allPoints);
    for (var i = 0; i < stages.length; i++) {
        var marker = L.marker(stages[i].stageCoord).addTo(map);

        // Add popups to markers (optional)
        marker.bindPopup(stages[i].stageName, {
            autoClose: false,
            closeOnClick: false
        });
    }
    // Custom divIcon for the rotating bus marker
    //busMarker.bindPopup("<strong>Hello world!</strong><br />I am a popup.", {maxWidth: 500});

    // Initialize an empty polyline for the bus's trail
    L.polyline(allPoints, // Outer stroke style
        {color: ' #3333ff', opacity: 0.8, weight: 5}).addTo(map);
    rotateMapToLocation(stages[0].stageCoord);
    startTraacking(busId, stages);
}

// Function to update the bus marker's position and rotation and log distance
let prevLocation;

function updateBusMarker(location, stages) {
    "use strict";
    if (!(prevLocation)) {
        rotateMapToLocation(L.latLng(location));
        busMarker.setLatLng(L.latLng(location));
        prevLocation = location;
        return 0;
    }
    const latLng = L.latLng(location);

    rotateMapToLocation(latLng);
    busMarker.setLatLng(latLng);
    trail.addLatLng(latLng);

    // Add the current position to the bus's trail

    // Calculate the angle between two points to set the rotation
    const angle = Math.atan2(location[1] - prevLocation[1], location[0] - prevLocation[0]);
    const degrees = (angle * 180) / Math.PI;
    // Set the rotation angle of the bus marker
    busMarker.options.rotationAngle = degrees;
    // console.log(busMarker.getLatLng());
    // const distance = map.distance(busMarker.getLatLng(), L.latLng(stages[stages.length - 1].stageCoord));
    // document.getElementById('remDis').innerText = (distance / 1000).toFixed(2) + " Kms";

}

function rotateMapToLocation(targetLatLng) {
    "use strict";
    if (targetLatLng) {
        // Calculate bearing between current marker position and target location
        var bearing = getBearing(busMarker.getLatLng(), targetLatLng);

        // Smoothly rotate the map
        map.setView(targetLatLng, 17, {
            animate: true,
            duration: 0.5,
            pan: {
                animate: true,
                duration: 0.5,
                easeLinearity: 0.5,
            },
            zoom: {
                animate: true,
                duration: 0.5,
            },
            bearing: bearing,
        });
    }
}

// Helper function to calculate bearing between two points
function getBearing(prevPoint, nextPoint) {
    "use strict";
    var x = Math.cos(nextPoint.lat) * Math.sin(nextPoint.lng - prevPoint.lng);
    var y = Math.cos(prevPoint.lat) * Math.sin(nextPoint.lat) -
        Math.sin(prevPoint.lat) * Math.cos(nextPoint.lat) * Math.cos(nextPoint.lng - prevPoint.lng);
    var bearing = Math.atan2(x, y);
    return (bearing * (180 / Math.PI) + 360) % 360;
}

let locationUpdaterWorker;

function startTraacking(routeId, stages) {
    "use strict";
    if (locationUpdaterWorker) {
        console.log('hello');
        locationUpdaterWorker.postMessage('close');
        locationUpdaterWorker.terminate();
        console.log('worker closed');
    }
// Add an event listener to the marker for movement
    locationUpdaterWorker = new Worker("/static/js/update_loc_worker.js");

// Send a message to the worker with routeId data
    locationUpdaterWorker.postMessage(routeId);

// Listen for messages from the worker
    locationUpdaterWorker.onmessage = function (event) {
        // Log the received data from the worker
        console.log("Received location update:", event.data.location);
        updateBusMarker(event.data.location, stages);
    };

// Error handling for web worker creation
    locationUpdaterWorker.onerror = function (error) {
        console.error("An error occurred in the locationUpdaterWorker:", error);
    };
}

function getRouteDetails(busid) {
    "use strict";
    getData('/apis/getRouteData/?busId=' + busid)
        .then(data => {
            showRoute(data.routeStageWithNames, data.routeAllCoord, busid);
            console.log(data); // JSON data parsed by `response.json()` call
        })
        .catch(error => {
            console.error('Error:', error);
        });
}