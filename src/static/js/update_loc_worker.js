/*jshint esversion: 9 */
/* global self*/
/* global EventSource*/
/* global console*/
/* global postMessage*/

self.addEventListener("message", function (e) {
    "use strict";
    // the passed-in data is available via e.data
    var source;

    function connect() {
        source = new EventSource("https://fleetmanager.onrender.com/apis/locationStream/" + e.data);

        source.onopen = function (event) {
            console.log("SSE connection established.");
        };

        source.onerror = function (event) {
            if (event.target.readyState === EventSource.CLOSED) {
                console.error("SSE connection closed.");
            } else {
                console.error("SSE connection error:", event);
                // Retry connection after some time
                //setTimeout(connect, 5000); // Retry after 5 seconds (adjust as needed)
            }
        };

        source.onmessage = function (event) {
            const recievedData = JSON.parse(event.data);
            console.log(recievedData);
            if (recievedData.event === "update") {
                postMessage(recievedData);
            }
        };
    }

    console.log(e.data);
    if (e.data === 'close' && source !== undefined) {
        console.log('Connection Closed');
        source.close();

    } else if (e.data !== 'close') {
        connect(); // Connect initially
    }
}, false);