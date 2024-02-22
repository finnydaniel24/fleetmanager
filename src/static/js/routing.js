// Function to generate cards for drivers

function postData(url = '', data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses JSON response into native JavaScript objects
}

function generateCards(drivers) {
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
    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value.toLowerCase();
    const filteredDrivers = document.getElementsByClassName('driverName').filter(driver =>
        driver.textContent.toLowerCase().includes(searchText)
    );
    generateCards(filteredDrivers);
}

let getLocationPromise = () => {
    return new Promise(function (resolve, reject) {
        // Promisifying the geolocation API
        console.log(navigator);
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(new Array(position.coords.latitude, position.coords.longitude)),
            (error) => reject(error)
        );
    });
};

var map = L.map('map').setView([14.028572109658956, 80.0218235993725], 15);
var selectedLocation = L.marker([0, 0], {draggable: true});
selectedLocation.addTo(map);
var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var googleSatellite = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Google Streets": googleStreets,
    "Google Satellite": googleSatellite
};

L.control.layers(baseMaps).addTo(map);

var routingControl = L.Routing.control({});

var allStages = [];
var stageMarkers = [];
var curStage;
let routeDetails = {};

function updateWaypoints(stageName, stageCoord) {
    var stageInputs = document.getElementById("stage-inputs");
    var stageInput = `
            <div class="stage-input">
            <label for="stage-${allStages.length}">Stage ${allStages.length}:</label>
            <input type="text" id="stage-${allStages.length}-name" value="${stageName}">
            <input type="text" id="stage-${allStages.length}-coordinates" value="${stageCoord}"></div>
        `;
    stageInputs.insertAdjacentHTML('beforebegin', stageInput);
}


function addStage() {
    var stageName = document.getElementById('stage-name').value;
    var stageCoord = document.getElementById('stage-coordinates').value;
    allStages.push([stageName, curStage]);
    updateWaypoints(stageName, stageCoord);
    let marker = L.marker(curStage, {draggable: false}).addTo(map).bindPopup(stageName, {
        autoClose: false,
        closeOnClick: false
    }).openPopup();
    stageMarkers.push(marker);
    selectedLocation.setLatLng([0, 0]);
}

document.getElementById('locateMe').addEventListener('click', async () => {
    const curLoc = await getLocationPromise();
    console.log(curLoc)
    map.setView(curLoc, 15)
    selectedLocation.setLatLng(curLoc);
    document.getElementById('stage-coordinates').value = curLoc;
    curStage = curLoc;
});
// Add the marker to the map
map.on('click', function (e) {
    var latlng = e.latlng;
    selectedLocation.setLatLng(latlng);
    document.getElementById('stage-coordinates').value = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7));
    curStage = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7))
});
selectedLocation.on('drag', function (e) {
    var latlng = e.latlng;
    selectedLocation.setLatLng(latlng);
    document.getElementById('stage-coordinates').value = latlng.lat.toFixed(7) + ', ' + latlng.lng.toFixed(7);
    curStage = new Array(latlng.lat.toFixed(7), latlng.lng.toFixed(7))
});

function calculateRoute() {
    const wayPoints = allStages.map(function (stage) {
        return stage[1];
    });
    stageMarkers.forEach(function (marker) {
        map.removeLayer(marker); // Remove each marker from the map
    });
    stageMarkers = [];
    console.log(wayPoints)
    map.removeControl(routingControl);
    routingControl = L.Routing.control({
        waypoints: wayPoints,
        lineOptions: {
            styles: [
                {color: '#fff', opacity: 1, weight: 8}, // Outer stroke style
                {color: ' #3333ff', opacity: 0.8, weight: 5} // Inner line style
            ]
        }
    }).addTo(map);
    routingControl.on('routesfound', function (e) {
        // Get the routes from the event object
        var routes = e.routes;
        // Iterate over each route
        routeDetails.routes = routes;
        for(i=0;i<routes[0].waypoints.length;i++){
            allStages[i][1]=[routes[0].waypoints[i].latLng.lat,routes[0].waypoints[i].latLng.lng];
        }
    });
    document.getElementsByClassName('leaflet-routing-container')[0].remove();
    console.log(routeDetails);
    var submitButton = `<form class="addBusForm" id="addBusForm">
        <h4>Enter Vehicle&Route Details </h4>
        <input type="text" name="driverName" placeholder="Enter Driver Name...">
        <br>
        <input type="number" name="busNumber" placeholder="Enter Bus Number..."><br>
        <input type="text" name="areaName" placeholder="Enter Route/Area Name With  ..."><br>
        <input type="text" name="routeName" placeholder="Enter subName like Via Bustand... "><br>
        </form><button type="button" class="custom-button" onclick="submitRoute()">Create Route</button>`
    document.getElementsByClassName('container2')[0].insertAdjacentHTML('beforeend', submitButton);

};

function submitRoute() {
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

function calculateRouteqdd() {
    const waypoints = allStages.map(function (stage) {
        return stage[0];
    });
    if (waypoints.length < 2) {
        alert("Please provide at least two waypoints.");
        return;
    }

    // Add routing control
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: true,
        lineOptions: {
            styles: [
                {color: '#fff', opacity: 1, weight: 8}, // Outer stroke style
                {color: ' #3333ff', opacity: 0.8, weight: 5} // Inner line style
            ]
        },
        createMarker: function (i, waypoint, number) {
            return L.marker(waypoint.latLng, {
                draggable: true,
                icon: L.divIcon({className: 'routing-icon'})
            }).addTo(map);
        }
    }).addTo(map);

    // Remove direction control panel
    var routeControlContainer = document.querySelector('.leaflet-routing-container');
    if (routeControlContainer) {
        routeControlContainer.remove();
    }

    // Save waypoints in cards
}

// Function to save waypoints in cards
function saveWaypointsInCards(waypoints) {
    const cardsContainer = document.getElementById("cardsContainer");
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <h2>Route ${cardsContainer.children.length + 1}</h2>
        <p>Name: ${waypoints[waypoints.length - 1].name}</p>
        <p>Latitude: ${waypoints[waypoints.length - 1].lat}</p>
        <p>Longitude: ${waypoints[waypoints.length - 1].lng}</p>
    `;
    cardsContainer.appendChild(card);

    // Add click event listener to show route when card is clicked
    card.addEventListener("click", () => showRouteOnMap(waypoints));
}

// Function to show route on map
function showRouteOnMap(waypoints) {
    // Clear existing waypoints and routing control
    waypointsLayer.clearLayers();
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Add waypoints to map
    waypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng]).addTo(waypointsLayer).bindPopup(`<b>Name:</b> ${waypoint.name}`);
    });

    // Calculate bounding box for waypoints
    const bounds = L.latLngBounds(waypoints.map(wp => L.latLng(wp.lat, wp.lng)));

    // Set map view to fit the bounding box
    map.fitBounds(bounds);

    // Add routing control
    routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: true,
        lineOptions: {
            styles: [
                {color: '#fff', opacity: 1, weight: 8}, // Outer stroke style
                {color: ' #3333ff', opacity: 0.8, weight: 5} // Inner line style
            ]
        },
        createMarker: function (i, waypoint, number) {
            return L.marker(waypoint.latLng, {
                draggable: true,
                icon: L.divIcon({className: 'routing-icon'})
            }).addTo(map);
        }
    }).addTo(map);

    // Remove direction control panel
    var routeControlContainer = document.querySelector('.leaflet-routing-container');
    if (routeControlContainer) {
        routeControlContainer.remove();
    }

    // Load saved waypoints from localStorage
    window.addEventListener("load", function () {
        const savedWaypointsHTML = localStorage.getItem("savedWaypoints");
        if (savedWaypointsHTML) {
            // Display saved waypoints in cards
            const cardsContainer = document.getElementById("cardsContainer");
            cardsContainer.innerHTML = savedWaypointsHTML;

            // Add click event listeners to each card
            const cards = cardsContainer.querySelectorAll(".card");
            cards.forEach(card => {
                const cardContent = card.innerHTML;
                card.addEventListener("click", function () {
                    // Retrieve saved waypoints from clicked card
                    const parser = new DOMParser();
                    const parsedHTML = parser.parseFromString(cardContent, "text/html");
                    const cardWaypoints = parsedHTML.querySelectorAll("p");
                    const waypoints = [];
                    cardWaypoints.forEach(waypoint => {
                        const name = waypoint.textContent.split(": ")[0];
                        const value = waypoint.textContent.split(": ")[1];
                        waypoints.push(value);
                    });
                    const latLngWaypoints = [];
                    for (let i = 1; i < waypoints.length; i += 2) {
                        const lat = parseFloat(waypoints[i]);
                        const lng = parseFloat(waypoints[i + 1]);
                        latLngWaypoints.push({lat: lat, lng: lng});
                    }
                    showRouteOnMap(latLngWaypoints); // Show route on map
                });
            });
        }
    });


// Save waypoints in localStorage
    function saveWaypointsToLocalstorage(data) {
        localStorage.setItem("savedWaypoints", data);
    }

// Load saved waypoints from localStorage
    window.addEventListener("load", function () {
        const savedWaypointsHTML = localStorage.getItem("savedWaypoints");
        if (savedWaypointsHTML) {
            // Display saved waypoints in cards
            const cardsContainer = document.getElementById("cardsContainer");
            cardsContainer.innerHTML = savedWaypointsHTML;

            // Add click event listeners to each card
            const cards = cardsContainer.querySelectorAll(".card");
            cards.forEach(card => {
                card.addEventListener("click", function () {
                    // Retrieve saved waypoints from clicked card
                    const cardWaypoints = Array.from(card.querySelectorAll("p")).map(p => p.textContent.split(": ")[1]);
                    const latLngWaypoints = [];
                    for (let i = 0; i < cardWaypoints.length; i += 3) {
                        const lat = parseFloat(cardWaypoints[i + 1]);
                        const lng = parseFloat(cardWaypoints[i + 2]);
                        latLngWaypoints.push({name: cardWaypoints[i], lat: lat, lng: lng});
                    }
                    showRouteOnMap(latLngWaypoints); // Show route on map
                });
            });
        }
    });

// Function to save waypoints in cards
    function saveWaypointsInCards(waypoints) {
        const cardsContainer = document.getElementById("cardsContainer");
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
        <h2>Route ${cardsContainer.children.length + 1}</h2>
        <p>Name: ${waypoints[waypoints.length - 1].name}</p>
        <p>Latitude: ${waypoints[waypoints.length - 1].lat}</p>
        <p>Longitude: ${waypoints[waypoints.length - 1].lng}</p>
    `;
        cardsContainer.appendChild(card);

        // Add click event listener to show route when card is clicked
        card.addEventListener("click", () => showRouteOnMap(waypoints));

        // Save waypoints in localStorage
        saveWaypointsToLocalstorage(cardsContainer.innerHTML);
    }


    updateWaypoints(); // Initialize with default value
}

