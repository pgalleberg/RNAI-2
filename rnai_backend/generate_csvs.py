from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pandas as pd

# import mongo objectid
from bson.objectid import ObjectId

import certifi
ca = certifi.where()

mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

db = mongo_client.rnai

for vertical in db.verticals.find({}):

    # get vertical id

    vertical_id = vertical['_id']

    counter = 0

    sample_dictionary = {'_id': ObjectId('64f47ffdf23bc4f67afc4180'), 'title': 'Learning Tethered Perching for Aerial Robots', '_vertical_id': ObjectId('64f44363f23bc4f67afbfdd1'), '_complete': False, '_reviewed': False, '_bucket_exists': False, '_cites_complete': False, '_cite_by_complete': False, '_authors_listed': False, '_authors_complete': False, '_citations_listed': False, '_level': 3, '_citation_count': None, '_cites': [], '_cited_by': [], '_score': 0.4}

    # create a dataframe where columns will get created based on keys in the sample_dictionary with title, and citation count, level and score coming first
    df = pd.DataFrame(columns=['title', 'level', 'score', '_id'])



    for paper in db.papers.find({'_vertical_id': vertical_id}):
        if '_score' in paper.keys():
            #' append dictionary matchiung the columns above

            print(paper['_citation_count'])

            new_row = {'title': paper['title'], 'level': paper['_level'], 'score': paper['_score'], '_id': str(paper['_id'])}


            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)


    # rank data frome in descending order of score
    df = df.sort_values(by=['score'], ascending=False)

    # create a csv file with the name of the vertical
    df.to_csv(vertical['name'] + '.csv', index=False)