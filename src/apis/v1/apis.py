"""
This module contains all the API endpoints.
"""
import sys
sys.path.append('src')
from controllers.appController import AppController,VehicleToServerConnectionManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from pydantic import BaseModel
import asyncio
from sse_starlette.sse import EventSourceResponse
import ast


class AddRouteType(BaseModel):
    driverName:str
    allStages: list
    busNumber: str
    routeName: str
    routes: list
    areaName: str

class NewLocation(BaseModel):
    locationCoord: list
    busId: str

appController = AppController()
connectionManager = VehicleToServerConnectionManager()


api = APIRouter(prefix="/apis",
                   tags=[ "apis" ])


@api.post('/addroute/')
async def addroute(request: Request, routeData: AddRouteType):
    return appController.createRoute(routeData)


@api.get('/locationStream/{busId}/')
async def locationStream(request: Request, busId):
    return EventSourceResponse(appController.eventGenerator(busId, request),
                               headers={"Cache-Control": "no-cache"})

@api.get('/getRouteData/')
async def getRouteData(request:Request):
    routeDetails = appController.getRouteDetails(request.query_params.get("busId"))
    return routeDetails



@api.websocket('/EstablishConnectionWithServer/')
async def websocket_endpoint(websocket: WebSocket):
    await connectionManager.connect(websocket)
    try:
        while (True):
            msgFromVehicle = await websocket.receive_text()
            print(msgFromVehicle)
            msgFromVehicle = ast.literal_eval(msgFromVehicle)
            if msgFromVehicle [ 'message' ] == 'connectionRequest':
                await connectionManager.boardcast_to_single(
                    {"busId": msgFromVehicle [ 'busId' ], "message": "Connection Established With Server"}, websocket)
                continue
            if await appController.updateBusNewLocation(msgFromVehicle [ 'vehicleCoord' ],
                                                                    msgFromVehicle [ 'busId' ]):
                await connectionManager.boardcast_to_single(
                    {"busId": msgFromVehicle [ 'busId' ], "message": "Location Updated"}, websocket)
            else:
                await connectionManager.boardcast_to_single(
                    {"busId": msgFromVehicle [ 'busId' ], "message": "Location Not Updated"}, websocket)

    except WebSocketDisconnect:
        await connectionManager.disconnect(websocket)
    except Exception as e:
        print(e.args, 'erre')
        pass

