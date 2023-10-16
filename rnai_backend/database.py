from scholarly import scholarly
import time
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
ca = certifi.where()

uri = "mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient("mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority", tlsCAFile = ca)

db = client.rnai

for coll in db.list_collection_names():
    db.drop_collection(coll)


vertical_name = 'methane removal from ambient air'

result = db.verticals.insert_one({"name": vertical_name})

vertical_id = result.inserted_id

#publication_names = ['Atmospheric methane removal: a research agenda']

publication_names = ['Atmospheric methane removal: a research agenda' ,'A novel green technology: Reducing carbon dioxide and eliminating methane from the atmosphere', 'Methane removal and atmospheric restoration', 'New Directions: Atmospheric methane removal as a way to mitigate climate change?', 'Methane removal seen as tool to slow warming']

authors_to_add = []
orgs_to_add = []
venues_to_add = []

for publication_name in publication_names:
    pub_summary = next(scholarly.search_pubs(publication_name))

    pub_summary['vertical_id'] = vertical_id

    result = db.venues.insert_one({'venue_name': pub_summary['bib']['venue']})
    
    pub_summary['venue_id'] = result.inserted_id

    db.publications.insert_one(pub_summary)

    authors_to_add = authors_to_add + pub_summary['author_id']

    time.sleep(1)

authors_to_add = list(set(authors_to_add))

for author_to_add in authors_to_add:
    if len(author_to_add) > 2:
        author_summary = scholarly.search_author_id(author_to_add)
        #orgs_to_add = orgs_to_add + [author_summary['organization']]
        print(author_summary)

        for key in author_summary.keys():
            if type(author_summary[key]) is int:
                author_summary[key] = str(author_summary[key])
        db.authors.insert_one(author_summary)

    time.sleep(1)

    