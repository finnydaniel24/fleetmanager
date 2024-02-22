from datetime import datetime, timedelta
from pytz import timezone
import uuid


def getDateTime():
    now_utc = datetime.now(timezone('UTC'))
    return now_utc


def utcfromtimestamp(date):
    return datetime.fromtimestamp(date, timezone('UTC'))


def getUniqueId():
    return str(uuid.uuid4())


def getCurrentTime():
    format = "%d-%m-%Y %H:%M:%S"
    now_utc = datetime.now(timezone('UTC'))
    asia_time = now_utc.astimezone(timezone('Asia/Kolkata'))
    return str(asia_time.strftime(format))
