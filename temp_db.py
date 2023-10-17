from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
ca = certifi.where()

mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

db = mongo_client.rnai

db.papers_archive.insert_many(db.papers.find({'_level': {'$gt': 1}}))
db.papers.delete_many({'_level': {'$gt': 1}})

# delete all papers where complete is not trye
db.papers_archive.insert_many(db.papers.find({'_complete': {'$ne': True}}))
db.papers.delete_many({'_complete': {'$ne': True}})