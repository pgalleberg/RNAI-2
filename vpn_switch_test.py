

from pymongo import MongoClient

def calculate_ranking(publication):
    level_index = publication['_level_index']
    citation_count = publication['_citation_count']
    vertical_id = publication['_vertical_id']['$oid']

    # Count occurrences of publication's _id in the _cited_by list of all other documents with the same _vertical_id
    occurrences = db.collection.count_documents({'_vertical_id': {'$oid': vertical_id}, '_cited_by': publication['_id']['$oid']})

    ranking = (5 - level_index) / 5 + citation_count / 100 + occurrences / 50
    return ranking

# Connect to the MongoDB database
client = MongoClient('<your-mongodb-connection-string>')
db = client['<your-database-name>']
collection = db['<your-collection-name>']

# Fetch all publications from the collection
publications = collection.find()

# Iterate over the publications and calculate the ranking for each
for publication in publications:
    ranking = calculate_ranking(publication)
    collection.update_one({'_id': publication['_id']}, {'$set': {'_ranking': ranking}})

# Sort the publications in descending order based on the ranking
sorted_publications = collection.find().sort('_ranking', -1)

# Print the sorted publications
for publication in sorted_publications:
    print(publication)
