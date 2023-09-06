from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
ca = certifi.where()

mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

iteration_config = {'name': 'default', 'depth': 5, 'cites': [18, 10, 5, 5, 5]}

db = mongo_client.rnai_deployment


for coll in db.list_collection_names():
    db.drop_collection(coll)
    
db.cite_parameters.insert_one({'name': 'default', 'depth': 5, 'cites': [18, 10, 5, 5, 5]})
