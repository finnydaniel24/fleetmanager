const drivers = [
    { name: "John Doe", age: 35, license: "ABC123" },
    { name: "Jane Smith", age: 28, license: "XYZ456" },
    { name: "Michael Johnson", age: 40, license: "DEF789" },
    { name: "Emily Davis", age: 32, license: "GHI012" },
    { name: "David Wilson", age: 45, license: "JKL345" }
];

// Function to generate cards for drivers
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
function saveDriversToLocalStorage(drivers) {
    localStorage.setItem("drivers", JSON.stringify(drivers));
}

// Function to load drivers from local storage
function loadDriversFromLocalStorage() {
    const savedDriversJSON = localStorage.getItem("drivers");
    return savedDriversJSON ? JSON.parse(savedDriversJSON) : [];
}

// Event listener for filtering cards on input change
document.getElementById("searchInput").addEventListener("input", filterCards);

// Function to filter and display cards based on search input
function filterCards() {
    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value.toLowerCase();
    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchText)
    );
    generateCards(filteredDrivers);
}

// Initialize with default value
generateCards(drivers);

// Save drivers to local storage when the page unloads
window.addEventListener("beforeunload", function() {
    saveDriversToLocalStorage(drivers);
});

// Load drivers from local storage on page load
document.addEventListener("DOMContentLoaded", function() {
    const savedDrivers = loadDriversFromLocalStorage();
    if (savedDrivers.length > 0) {
        generateCards(savedDrivers);
    }
});



var map = L.map('map').setView([14.98922903510363, 79.08168722809981], 13);
var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var googleSatellite = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Google Streets": googleStreets,
    "Google Satellite": googleSatellite
};

L.control.layers(baseMaps).addTo(map);

var waypointsLayer = L.layerGroup().addTo(map); // Layer group for waypoints
var routingControl;

function updateWaypoints() {
    var numStages = parseInt(document.getElementById("num-stages").value);
    var stageInputs = document.getElementById("stage-inputs");
    stageInputs.innerHTML = ""; // Clear existing inputs
    for (var i = 0; i < numStages; i++) {
        var stageInput = document.createElement("div");
        stageInput.className = "stage-input";
        stageInput.innerHTML = `
            <label for="stage-${i + 1}">Stage ${i + 1}:</label>
            <input type="text" id="stage-${i + 1}-name" placeholder="Name">
            <input type="text" id="stage-${i + 1}-coordinates" placeholder="Latitude,Longitude">
        `;
        stageInputs.appendChild(stageInput);
    }
}

function calculateRoute() {
    var waypoints = [];
    waypointsLayer.clearLayers(); // Clear existing waypoints
    var numStages = parseInt(document.getElementById("num-stages").value);
    for (var i = 0; i < numStages; i++) {
        var name = document.getElementById("stage-" + (i + 1) + "-name").value;
        var coordinates = document.getElementById("stage-" + (i + 1) + "-coordinates").value.split(",");
        var lat = parseFloat(coordinates[0]);
        var lng = parseFloat(coordinates[1]);
        waypoints.push({ name: name, lat: lat, lng: lng }); // Save coordinates in an array
        // Add marker for waypoint with name
        var marker = L.marker([lat, lng]).addTo(waypointsLayer).bindPopup(`
            <b>Name:</b> ${name}
        `);
    }

    if (waypoints.length < 2) {
        alert("Please provide at least two waypoints.");
        return;
    }

    // Calculate bounding box for waypoints
    var bounds = L.latLngBounds(waypoints.map(wp => L.latLng(wp.lat, wp.lng)));

    // Set map view to fit the bounding box
    map.fitBounds(bounds);

    // Add routing control
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: true,
        lineOptions: {
            styles: [
                { color: '#fff', opacity: 1, weight: 8 }, // Outer stroke style
                { color: ' #3333ff', opacity: 0.8, weight: 5 } // Inner line style
            ]
        },
        createMarker: function(i, waypoint, number) {
            return L.marker(waypoint.latLng, {
                draggable: true,
                icon: L.divIcon({ className: 'routing-icon'})
            }).addTo(map);
        }
    }).addTo(map);
    
    // Remove direction control panel
    var routeControlContainer = document.querySelector('.leaflet-routing-container');
    if (routeControlContainer) {
        routeControlContainer.remove();
    }

    // Save waypoints in cards
    saveWaypointsInCards(waypoints);
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
                { color: '#fff', opacity: 1, weight: 8 }, // Outer stroke style
                { color: ' #3333ff', opacity: 0.8, weight: 5 } // Inner line style
            ]
        },
        createMarker: function(i, waypoint, number) {
            return L.marker(waypoint.latLng, {
                draggable: true,
                icon: L.divIcon({ className: 'routing-icon'})
            }).addTo(map);
        }
    }).addTo(map);

    // Remove direction control panel
    var routeControlContainer = document.querySelector('.leaflet-routing-container');
    if (routeControlContainer) {
        routeControlContainer.remove();
    }

    // Load saved waypoints from localStorage
window.addEventListener("load", function() {
    const savedWaypointsHTML = localStorage.getItem("savedWaypoints");
    if (savedWaypointsHTML) {
        // Display saved waypoints in cards
        const cardsContainer = document.getElementById("cardsContainer");
        cardsContainer.innerHTML = savedWaypointsHTML;

        // Add click event listeners to each card
        const cards = cardsContainer.querySelectorAll(".card");
        cards.forEach(card => {
            const cardContent = card.innerHTML;
            card.addEventListener("click", function() {
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
                    latLngWaypoints.push({ lat: lat, lng: lng });
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
window.addEventListener("load", function() {
    const savedWaypointsHTML = localStorage.getItem("savedWaypoints");
    if (savedWaypointsHTML) {
        // Display saved waypoints in cards
        const cardsContainer = document.getElementById("cardsContainer");
        cardsContainer.innerHTML = savedWaypointsHTML;

        // Add click event listeners to each card
        const cards = cardsContainer.querySelectorAll(".card");
        cards.forEach(card => {
            card.addEventListener("click", function() {
                // Retrieve saved waypoints from clicked card
                const cardWaypoints = Array.from(card.querySelectorAll("p")).map(p => p.textContent.split(": ")[1]);
                const latLngWaypoints = [];
                for (let i = 0; i < cardWaypoints.length; i += 3) {
                    const lat = parseFloat(cardWaypoints[i + 1]);
                    const lng = parseFloat(cardWaypoints[i + 2]);
                    latLngWaypoints.push({ name: cardWaypoints[i], lat: lat, lng: lng });
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

