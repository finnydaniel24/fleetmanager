"""
This module contains code to run the app
"""
import sys
sys.path.append('src')
from apis.v1 import apis
from routes import routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.include_router(routes.routes)
app.include_router(apis.api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "*" ],
    allow_credentials=True,
    allow_methods=[ "*" ],
    allow_headers=[ "*" ],
)
app.mount("/static", StaticFiles(directory="src/static"), name="static")