import os
from functools import wraps
import sys
sys.path.append('src')
from util.helperFunctions import getDateTime, utcfromtimestamp
from dotenv import load_dotenv
from flask import request
load_dotenv()
import jwt


def token_required(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers [ "Authorization" ].split(" ") [ 1 ]
        if not token:
            return 'Invalid Token or Token Header not Found', 401
        data = jwt.decode(token, os.environ.get('secret_key'), algorithms=[ "HS256" ])
        if 'exp' in data and getDateTime() > utcfromtimestamp(data [ 'exp' ]):
            return "Token has expired. Please Login Again", 401
        current_user = "DemoUser"  # await db.getUser(data [ 'userId' ])
        if current_user is None:
            return {
                "message": "Invalid Authentication token!",
                "data": None,
                "error": "Unauthorized"
            }, 401
        # if not current_user [ 1 ] [ 'userStatus' ]:
        #     return {
        #         "message": "Your account is disabled by admin. Please contact admin"
        #     }, 401

        return await f(*args, **kwargs)

    return decorated
