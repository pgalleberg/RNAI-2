from flask import Flask, jsonify
from flask_cors import CORS
from celery import Celery, chain, group, chord
from flask import request
from config import db
from routes.genericNames import genericNames
from routes.admin import admin
from routes.ui import ui
import requests
import traceback
from bson.objectid import ObjectId
import os

app = Flask(__name__)

app.config['DEBUG'] = True
print("os.getenv(\"REDIS_CONN_STRING\"): ", os.getenv("REDIS_CONN_STRING"))
print("os.getenv(\"OPENAI_API_KEY\"): ", os.getenv("OPENAI_API_KEY"))

app.config['CELERY_BROKER_URL'] = os.getenv("REDIS_CONN_STRING")
app.config['CELERY_RESULT_BACKEND'] = os.getenv("REDIS_CONN_STRING")

celery = Celery(__name__, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)
# celery.log.setup_logging_subsystem(loglevel='INFO', logfile=file_name)

app.register_blueprint(genericNames, url_prefix='')
app.register_blueprint(admin, url_prefix='')
app.register_blueprint(ui, url_prefix='')

#CORS(app, resources={r"/*": {"origins": os.getenv("ORIGIN")}})
CORS(app, resources={r"/*": {"origins": "*"}})

s2_api_key = os.getenv("S2_API_KEY")

headers = {
    'x-api-key': s2_api_key
}

@celery.task() #name='__main__.tasks.getPapersFromS2'
def getPapersFromS2(vertical_id, paper_titles):
    print('getPapersFromS2::getPapersFromS2 called')

    paper_titles = [title for title in paper_titles if title.strip() != '']
    task_chains = [
        chain(
            getPaperId.s(title), 
            getPaperDetails.s(vertical_id, 0), 
            group(
                insertInDb.s('papers'),
                chain(getAuthorDetails.s(), insertInDb.s('authors')),
                chain(getPaperDetailsBulk.s("citations"), group(insertInDb.s("papers"), getAuthorDetailsBulk.s(vertical_id, 1)), insertInDb.s("authors")),
                chain(getPaperDetailsBulk.s("references"), group(insertInDb.s("papers"), getAuthorDetailsBulk.s(vertical_id, 1)), insertInDb.s("authors"))
            )
        ) for title in paper_titles
    ]

    chord(task_chains)(update_vertical.si(vertical_id, 'Completed'))

@celery.task(rate_limit='1/s')
def getPaperId(title):
    print("getPaperId::getPaperId API called")
    if title.strip() != '':
        try:
            url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + title + "&limit=1&fields=title"
            print("getPaperId::sending request")
            response = requests.get(url, headers=headers).json()
            print('getPaperId::response: ', response)
            paper_id = response['data'][0]['paperId']
            print('getPaperId::paperId: ', paper_id)
            return paper_id
        
        except Exception as e:
            print("getPaperId::e: {}".format(e))
            print("getPaperId::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperId::response: {}".format(response))
            
            return -1


@celery.task(rate_limit='10/s')
def getPaperDetails(paper_id, vertical_id, depth):
    print("getPaperDetails::getPaperDetails API called")
    print("getPaperDetails::paper_id: {}".format(paper_id))
    if paper_id != -1 and paper_id != None:
        try:
            url = "https://api.semanticscholar.org/graph/v1/paper/" + paper_id + "?fields=url,title,venue,publicationVenue,year,authors,abstract,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,tldr,citations,references"
            paper_details = requests.get(url, headers=headers).json()
            print("getPaperDetails::paper_details: {}".format(paper_details))
            paper_details["vertical_id"] = vertical_id
            paper_details["depth"] = depth
            paper_details["source"] = 'manual'
            paper_details["source_paper_id"] = paper_id
            
            return paper_details

        except Exception as e:
            print("getPaperDetails::e: {}".format(e))
            print("getPaperDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperDetails::paper_details: {}".format(paper_details))


@celery.task(rate_limit='1/s')
def getPaperDetailsBulk(paper_details, sourced_from):
    print("getPaperDetailsBulk::getPaperDetailsBulk API called")
    print("getPaperDetailsBulk::paper_details: {}".format(paper_details))
    if paper_details != None and paper_details.get("message", -1) == -1:
        try:
            source_paper_id = paper_details['paperId']
            papers = paper_details[sourced_from]
            paper_ids = [paper['paperId'] for paper in papers]
            print("paper_ids: ", paper_ids)
            vertical_id = paper_details['vertical_id']
            depth = paper_details['depth'] + 1

            if len(paper_ids) > 0:
                response = requests.post(
                    "https://api.semanticscholar.org/graph/v1/paper/batch",
                    headers=headers,
                    params={'fields': 'url,title,venue,publicationVenue,year,authors,abstract,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,tldr,citations,references'},
                    json={'ids': paper_ids}
                )

                papers = response.json()
                print("getPaperDetailsBulk::papers: {}".format(papers))

                papers = [paper for paper in papers if paper != None]

                for paper in papers:
                    #print("getPaperDetailsBulk::paper:", papers)
                    paper['source_paper_id'] = source_paper_id
                    paper["vertical_id"] = vertical_id
                    paper["depth"] = depth
                    paper["source"] = sourced_from

                return papers

        except Exception as e:
            print("getPaperDetailsBulk::e: {}".format(e))
            print("getPaperDetailsBulk::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperDetailsBulk::response: {}".format(response))        


@celery.task(rate_limit='10/s')
def getAuthorDetails(paper_details):
    print("getAuthorDetails::getAuthorDetails API called")
    print("getAuthorDetails::paper_details: {}".format(paper_details))
    if paper_details != None and paper_details.get("message", -1) == -1:
        try:
            authors = paper_details['authors']
            author_ids = [author['authorId'] for author in authors]
            paper_id = paper_details['paperId']
            vertical_id = paper_details["vertical_id"]
            depth = paper_details["depth"]
            
            if len(author_ids) > 0:
                response = requests.post(
                    "https://api.semanticscholar.org/graph/v1/author/batch",
                    headers=headers,
                    params={'fields': 'url,name,aliases,affiliations,homepage,paperCount,citationCount,hIndex,papers'},
                    json={'ids': author_ids}
                )

                authors = response.json()
                authors = [author for author in authors if author != None]

                for author in authors:
                    author['source_paper_id'] = paper_id
                    author["vertical_id"] = vertical_id
                    author["depth"] = depth     

                return authors
            
        except Exception as e:
            print("getAuthorDetails::e: {}".format(e))
            print("getAuthorDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetails::response: {}".format(response))

    
@celery.task(rate_limit='10/s')
def getAuthorDetailsBulk(paper_details_bulk, vertical_id, depth):
    print("getAuthorDetailsBulk::getAuthorDetailsBulk API called")
    print("getAuthorDetailsBulk::paper_details_bulk: {}".format(paper_details_bulk))
    if paper_details_bulk != None and isinstance(paper_details_bulk, dict) and paper_details_bulk.get("message", -1) == -1:
        try:
            author_paper_mapping = {}
            for paper in paper_details_bulk:
                for author in paper['authors']:
                    author_id = author['authorId']
                    paper_id = paper['paperId']
                    if author_paper_mapping.get(author_id, False) == False:
                        author_paper_mapping[author_id] = [paper_id]
                    else:
                        author_paper_mapping[author_id].append(paper_id)

            #print("getAuthorDetailsBulk::author_paper_mapping: ", author_paper_mapping)
            author_ids = list(author_paper_mapping.keys())

            if len(author_ids) > 0:
                response = requests.post(
                    "https://api.semanticscholar.org/graph/v1/author/batch",
                    headers=headers,
                    params={'fields': 'url,name,aliases,affiliations,homepage,paperCount,citationCount,hIndex'},#,papers
                    json={'ids': author_ids}
                )

                authors = response.json()
                authors = [author for author in authors if author != None]

                for author in authors:
                    # print("getAuthorDetailsBulk::author: {}".format(author))
                    author['source_paper_ids'] = author_paper_mapping[author['authorId']]
                    author['verticalPaperCount'] = len(author_paper_mapping[author['authorId']])
                    author["vertical_id"] = vertical_id
                    author["depth"] = depth     

                return authors
        
        except Exception as e:
            print("getAuthorDetailsBulk::e: {}".format(e))
            print("getAuthorDetailsBulk::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetailsBulk::response: {}".format(response))
            

@celery.task
def insertInDb(record, table):
    if record != None:
        try:
            collection = db[table]

            print("insertInDb::table: {}".format(table))

            if isinstance(record, dict):
                collection.insert_one(record)
            elif isinstance(record, list):

                # remove all nones. Catering to record = [None, None] & record = [None, [{}, ...]]
                record = [rec for rec in record if rec != None]

                # if 2d list then pass only the last index. Catering to record = [None, [{}, ...]] => [[{}, ...]]
                if len(record) > 0 and isinstance(record[0], list):
                    record = record[0]

                if len(record) > 0:
                    collection.insert_many(record)
                
        except Exception as e:
            print("insertInDb::e: {}".format(e))
            print("insertInDb::error_details: {}".format(traceback.format_exc()))
            print("insertInDb::table: {}".format(table))
            print("insertInDb::type(record): {}".format(type(record)))
            print("insertInDb::len(record): {}".format(len(record)))
            print("insertInDb::record: {}".format(record))

@celery.task
def update_vertical(id, status):
    try:
        print("update_vertical::id:", id)
        print("update_vertical::status:", status)

        collection = db['verticals']
        filter_criteria = {'_id': ObjectId(id)}
        update_data = {'$set': {'status': 'Completed'}}

        updated_document = collection.find_one_and_update(
            filter_criteria,
            update_data,
            return_document=True
        )

        print('update_vertical::updated_document: ', updated_document)
    
    except Exception as e:
        print("update_vertical::e: {}".format(e))
        print("update_vertical::error_details: {}".format(traceback.format_exc()))


@app.route('/tasks', methods=['POST'])
def createVertical():
    print("creating vertical")
    print(request.json)

    try:
        record = request.json
        record_to_insert = record.copy()

        # Insert the record into the collection
        collection = db["verticals"]
        vertical_id = collection.insert_one(record_to_insert).inserted_id

        # Print the ID of the inserted record
        print(f"Record inserted with ID: {vertical_id}")
        getPapersFromS2.delay(str(vertical_id), record['papers'])
    
    except Exception as e:
        print("createVertical::e: ", e)
        print("createVertical::e::error_details: ", traceback.format_exc())

    return record, 201

if __name__ == "__main__":
    app.run()

# getPapersFromS2.delay('6557a45d503f29770fd5b5c8', ["Atmospheric methane removal: a research agenda", "New Directions: Atmospheric methane removal as a way to mitigate climate change?"])

# New Directions: Atmospheric methane removal as a way to mitigate climate change?
# Soft Robot Actuation Strategies for Locomotion in Granular Substrates
# Atmospheric methane removal: a research agenda
