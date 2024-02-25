import sys

sys.path.append('src')
import asyncio
import json
import ssl
import time

import certifi
import websockets

from controllers.appController import AppController

'''app = AppController()
alld=[]
for i in app.getRouteDetails('3')['routeAllCoord']:
    alld.append(list(i.values()))
print(alld)'''
alld = [ [ 14.03247, 80.0294 ], [ 14.03251, 80.02943 ], [ 14.03251, 80.02943 ], [ 14.03281, 80.02904 ],
         [ 14.03319, 80.02854 ], [ 14.0337, 80.02789 ], [ 14.0338, 80.02776 ], [ 14.03435, 80.02701 ],
         [ 14.03523, 80.02578 ], [ 14.03592, 80.02466 ], [ 14.03622, 80.02413 ], [ 14.03622, 80.02413 ],
         [ 14.03622, 80.02413 ], [ 14.03633, 80.02392 ], [ 14.03695, 80.02276 ], [ 14.0383, 80.01998 ],
         [ 14.03925, 80.01808 ], [ 14.04035, 80.01571 ], [ 14.04147, 80.01338 ], [ 14.04231, 80.01161 ],
         [ 14.04296, 80.01007 ], [ 14.0441, 80.00733 ], [ 14.04491, 80.0054 ], [ 14.0452, 80.0047 ],
         [ 14.04598, 80.00284 ], [ 14.04706, 80.00029 ], [ 14.04807, 79.99786 ], [ 14.04921, 79.995 ],
         [ 14.05034, 79.99228 ], [ 14.05149, 79.98931 ], [ 14.05202, 79.98772 ], [ 14.05202, 79.98772 ],
         [ 14.05202, 79.98772 ], [ 14.05208, 79.98755 ], [ 14.05287, 79.98516 ], [ 14.05389, 79.98226 ],
         [ 14.05434, 79.98095 ], [ 14.05436, 79.9809 ], [ 14.05451, 79.98044 ], [ 14.05464, 79.98008 ],
         [ 14.05559, 79.97737 ], [ 14.05647, 79.97461 ], [ 14.05711, 79.97264 ], [ 14.05744, 79.97145 ],
         [ 14.05757, 79.97071 ], [ 14.05767, 79.97012 ], [ 14.05767, 79.97012 ] ]

# Define an SSL context that will connect to TLS 1.2+ servers
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
ssl_context.maximum_version = ssl.TLSVersion.TLSv1_3

# Load the certificates authorities via the certifi library
ssl_context.load_verify_locations(certifi.where())


async def connect_to_websocket():
    uri = "ws://127.0.0.1:8000/apis/EstablishConnectionWithServer/"  # Replace with the WebSocket server address

    async with websockets.connect(uri) as websocket:
        # Send a message to the server (optional)
        await websocket.send(json.dumps({"message": "connectionRequest", "busId": "5"}))

        # Receive messages from the server
        i = 0
        while True and i < len(alld):
            message = await websocket.recv()
            print(f"Received message from server: {message}")
            await websocket.send(json.dumps({"vehicleCoord": alld [ i ], "message": "New Location", "busId": "5"}))
            i += 1


# Run the WebSocket connection coroutine
asyncio.get_event_loop().run_until_complete(connect_to_websocket())
