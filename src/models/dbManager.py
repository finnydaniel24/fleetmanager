"""
This module contains methods to interact with the database.
"""
import sys

sys.path.append('src')
from config.dbConfig import db
from util.helperFunctions import getDateTime, getCurrentTime, getUniqueId
from bson import json_util
import json


class DBManager:

    def __init__(self):
        self.routesCol = db [ 'routes' ]
        self.usersCol = db [ 'users' ]
        self.busesCol = db [ 'buses' ]

    def createRoute(self, routeData):
        routeData [ "routeId" ] = getUniqueId()
        routeData [ "createdAt" ] = getCurrentTime()
        routeData [ "updatedAt" ] = getCurrentTime()
        self.routesCol.insert_one(routeData)
        return json.loads(json_util.dumps(routeData))

    def getRouteDetails(self, busId):
        routeData = self.routesCol.find_one({"busNoAllotedToRoute": busId})
        return json.loads(json_util.dumps(routeData))

    def getAllRoutes(self):
        allRoutes = self.routesCol.find({})
        return json.loads(json_util.dumps(allRoutes))

    async def fetchRouteLocation(self, busId):
        location = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"lastUpdatedLoc": 1})
        if location [ 'lastUpdatedLoc' ] == [ ]:
            print("No location found")
            return self.getAllStagesCoords(busId) [ 0 ] [ 'stageCoord' ]
        return location [ 'lastUpdatedLoc' ] [ -1 ]

    async def updateNewLocation(self, location: list, busId):
        self.routesCol.update_one({"busNoAllotedToRoute": busId},
                                  {"$push": {"lastUpdatedLoc": {"$each": [ location ], "$slice": -10}}})
        return True

    def getAllStagesCoords(self, busId):
        AllStages = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"routeStageWithNames": 1})
        return AllStages [ 'routeStageWithNames' ]

    def gettotalDistance(self, busId):
        totalDistance = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"totalRouteDistance": 1})
        return totalDistance [ 'totalRouteDistance' ]

    def getCurStage(self, busId):
        curStage = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"curStage": 1})
        return curStage [ 'curStage' ]

    def updateCurStage(self, busId, curStage):
        self.routesCol.update_one({"busNoAllotedToRoute": busId}, {"$set": {"curStage": curStage}})

    def getLastTwoLOcations(self, busId):
        lastTwoLOcations = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"lastUpdatedLoc": 1})
        if lastTwoLOcations [ 'lastUpdatedLoc' ] == [ ] or len(lastTwoLOcations [ 'lastUpdatedLoc' ]) < 2:
            return False
        return lastTwoLOcations [ 'lastUpdatedLoc' ] [ -1:-3:-1 ]

    def getVehicleDirection(self, busId):
        vehicleDirection = self.routesCol.find_one({"busNoAllotedToRoute": busId}, {"busMoveDirection": 1})
        return vehicleDirection [ 'busMoveDirection' ]

    def updateBusDirection(self, busId, direction):
        self.routesCol.update_one({"busNoAllotedToRoute": busId}, {"$set": {"busMoveDirection": direction}})
        return True

    def updateStagesDetails(self, busId, stageDetails):
        self.routesCol.update_one({"busNoAllotedToRoute": busId},
                                  {"$push": {"routeStageVisitInfo": {"$each": [ stageDetails ], "$slice": -10000}}})
