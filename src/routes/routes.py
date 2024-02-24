"""
This files consists of all the routes
"""
import sys
sys.path.append('src')
from controllers.appController import AppController
from fastapi import APIRouter,Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

routes = APIRouter()
templates = Jinja2Templates(directory="src/templates")
appController = AppController()

@routes.get('/')
def index(request: Request):
    return templates.TemplateResponse('Dashboard.html', {'request': request})


@routes.get('/auth/')
def auth(request: Request):
    return templates.TemplateResponse('login.html',{'request': request})


@routes.get('/allRoutes/')
async def liveTracking(request: Request):
    allRoutes=appController.getAllRoutes()
    return templates.TemplateResponse('routing.html',{'request': request,'allRoutes':allRoutes})

@routes.get('/recordLocation/{busId}')
async def recordLocation(request:Request,busId):
    return templates.TemplateResponse('demoRecordMobileGps.html',{"request":request,"busId":busId})


