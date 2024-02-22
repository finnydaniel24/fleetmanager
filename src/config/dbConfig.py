import os
import pymongo
import certifi

ca = certifi.where()
client = pymongo.MongoClient('#'
                             , tlsCAFile=ca)
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db = client [ 'fleet' ]
