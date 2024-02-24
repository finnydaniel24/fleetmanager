// Function to generate cards for drivers
/*jshint esversion: 9 */
/* global console*/
/* global L*/

/* global alert*/


function postData(url = '', data = {}) {

    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data) // body data type must match "Content-Type" header
    })

        .then(response => response.json()); // parses JSON response into native JavaScript objects
}

function generateCards(drivers) {
    "use strict";
    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = ""; // Clear existing cards

    drivers.forEach(driver => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h2>${driver.name}</h2>
            <p>Age: ${driver.age}</p>
            <p>License: ${driver.license}</p>
        `;
        cardsContainer.appendChild(card);
    });
}

// Function to save drivers to local storage

// Function to load drivers from local storage

// Event listener for filtering cards on input change
document.getElementById("searchInput").addEventListener("input", filterCards);

// Function to filter and display cards based on search input
function filterCards() {
    "use strict";
    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value.toLowerCase();
    const filteredDrivers = document.getElementsByClassName('driverName').filter(driver => driver.textContent.toLowerCase().includes(searchText));
    generateCards(filteredDrivers);
}

let getLocationPromise = () => {
    "use strict";
    return new Promise(function (resolve, reject) {
        // Promisifying the geolocation API
        console.log(navigator);
        navigator.geolocation.getCurrentPosition((position) => resolve(new Array(position.coords.latitude, position.coords.longitude)), (error) => reject(error));
    });
};

var map = L.map('map').setView([14.028572109658956, 80.0218235993725], 15);
var selectedLocation = L.marker([0, 0], {draggable: true});
selectedLocation.addTo(map);
var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap contributors'
}).addTo(map);

var googleSatellite = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var baseMaps = {
    "OpenStreetMap": openStreetMap, "Google Streets": googleStreets, "Google Satellite": googleSatellite
};

L.control.layers(baseMaps).addTo(map);

var routingControl = L.Routing.control({});

var allStages = [];
var stageMarkers = [];
var curStage;
let routeDetails = {};

function updateWaypoints(stageName, stageCoord) {
    "use strict";
    var stageInputs = document.getElementById("stage-inputs");
    var stageInput = `
            <div class="stage-input">
            <label for="stage-${allStages.length}">Stage ${allStages.length}:</label>
            <input type="text" id="stage-${allStages.length}-name" value="${stageName}" readonly>
            <input type="text" id="stage-${allStages.length}-coordinates" value="${stageCoord}" readonly></div>
        `;
    stageInputs.insertAdjacentHTML('beforebegin', stageInput);
}


function addStage() {
    "use strict";
    var stageName = document.getElementById('stage-name').value;
    var stageCoord = document.getElementById('stage-coordinates').value;
    stageCoord = stageCoord.split(",").map(parseFloat);
    allStages.push([stageName, stageCoord]);
    updateWaypoints(stageName, stageCoord);
    curStage = stageCoord;
    let marker = L.marker(curStage, {draggable: false}).addTo(map).bindPopup(stageName, {
        autoClose: false, closeOnClick: false
    }).openPopup();
    stageMarkers.push(marker);
    selectedLocation.setLatLng([0, 0]);
}

document.getElementById('locateMe').addEventListener('click', async () => {
    "use strict";
    const curLoc = await getLocationPromise();
    console.log(curLoc);
    map.setView(curLoc, 15);
    selectedLocation.setLatLng(curLoc);
    document.getElementById('stage-coordinates').value = curLoc;
    curStage = curLoc;
});

function calculateRoute() {
    "use strict";
    const wayPoints = allStages.map(function (stage) {
        return stage[1];
    });
    stageMarkers.forEach(function (marker) {
        map.removeLayer(marker); // Remove each marker from the map
    });
    stageMarkers = [];
    console.log(wayPoints);
    map.removeControl(routingControl);
    routingControl = L.Routing.control({
        waypoints: wayPoints, lineOptions: {
            styles: [{color: '#fff', opacity: 1, weight: 8}, // Outer stroke style
                {color: ' #3333ff', opacity: 0.8, weight: 5} // Inner line style
            ]
        }
    }).addTo(map);
    routingControl.on('routesfound', function (e) {
        // Get the routes from the event object
        var routes = e.routes;
        // Iterate over each route
        routeDetails.routes = routes;
        for (var i = 0; i < routes[0].waypoints.length; i++) {
            allStages[i][1] = [routes[0].waypoints[i].latLng.lat, routes[0].waypoints[i].latLng.lng];
        }
    });
    document.getElementsByClassName('leaflet-routing-container')[0].remove();
    console.log(routeDetails);
    const submitButton = `<form class="addBusForm" id="addBusForm">
        <h4>Enter Vehicle&Route Details </h4>
        <input type="text" name="driverName" placeholder="Enter Driver Name...">
        <br>
        <input type="number" name="busNumber" placeholder="Enter Bus Number..."><br>
        <input type="text" name="areaName" placeholder="Enter Route/Area Name With  ..."><br>
        <input type="text" name="routeName" placeholder="Enter subName like Via Bustand... "><br>
        </form><button type="button" class="custom-button" onclick="submitRoute()">Create Route</button>`;
    document.getElementsByClassName('container2')[0].insertAdjacentHTML('beforeend', submitButton);

}

function submitRoute() {
    "use strict";
    var routeForm = document.getElementById('addBusForm');
    let formData = new FormData(routeForm);
    routeDetails.allStages = allStages;
    routeDetails = {...routeDetails, ...Object.fromEntries(formData)};
    console.log(routeDetails);
    postData('/apis/addroute', routeDetails)
        .then(data => {
            console.log(data);
            alert(data);// JSON data parsed by `response.json()` call
            window.location.reload();
        })
        .catch(error => {
            alert(error);
            console.error('Error:', error);
        });
}

function showAddRoute() {
    "use strict";
    document.getElementsByClassName('container2')[0].style.display = 'block';
    map.eachLayer(function (layer) {
        // Check if the layer is a marker
        if (layer instanceof L.Marker) {
            // Remove the marker from the map
            map.removeLayer(layer);
        } else if (layer instanceof L.Polyline) {
            // Remove the polyline from the map
            map.removeLayer(layer);
        }
    });

// Add the marker to the map
    map.on('click', function (e) {
        var latlng = e.latlng;
        selectedLocation.setLatLng(latlng);
        document.getElementById('stage-coordinates').value = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7));
        curStage = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7));
    });
    selectedLocation.on('drag', function (e) {
        var latlng = e.latlng;
        selectedLocation.setLatLng(latlng);
        document.getElementById('stage-coordinates').value = latlng.lat.toFixed(7) + ', ' + latlng.lng.toFixed(7);
        curStage = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7));
    });
}
