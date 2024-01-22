from flask import Flask
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
from celery.exceptions import SoftTimeLimitExceeded, MaxRetriesExceededError
from S2Error import S2Error
import pinecone
import openai as openai

app = Flask(__name__)

app.config['DEBUG'] = True
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

pinecone_api_key = os.getenv("PINECONE_API_KEY")
env = 'gcp-starter'
pinecone.init(api_key=pinecone_api_key, environment=env)
index_name = 'grants-gov'
index = pinecone.Index(index_name)


@celery.task(soft_time_limit=60, autoretry_for=(SoftTimeLimitExceeded,), max_retries=3, default_retry_delay=10) #name='__main__.tasks.getPapersFromS2'
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


@celery.task(bind=True, rate_limit='1/s', soft_time_limit=60, max_retries=3, default_retry_delay=10)
def getPaperId(self, title):
    print("getPaperId::getPaperId API called")
    if title.strip() != '':
        try:
            url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + title + "&limit=1&fields=title"
            print("getPaperId::sending request")
            response = requests.get(url, headers=headers).json()
            print('getPaperId::response: ', response)

            if response.get("message", -1) != -1 or response.get("error", -1) != -1:
                raise S2Error("Semantic Scholar API Error")

            paper_id = response['data'][0]['paperId']
            print('getPaperId::paperId: ', paper_id)
            return paper_id
        
        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getPaperId::SoftTimeLimitExceeded/S2Error")
            print("getPaperId::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getPaperId::MaxRetriesExceededError")
                print("getPaperId::e: {}".format(e))

        
        except Exception as e:
            print("getPaperId::e: {}".format(e))
            print("getPaperId::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperId::response: {}".format(response))
            
            return -1
        

@celery.task(bind=True, rate_limit='10/s', soft_time_limit=60, max_retries=3, default_retry_delay=15)
def getPaperDetails(self, paper_id, vertical_id, depth):
    print("getPaperDetails::getPaperDetails API called")
    print("getPaperDetails::paper_id: {}".format(paper_id))
    if paper_id != -1 and paper_id != None:
        try:
            url = "https://api.semanticscholar.org/graph/v1/paper/" + paper_id + "?fields=url,title,venue,publicationVenue,year,authors,abstract,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,tldr,citations,references"
            paper_details = requests.get(url, headers=headers).json()
            print("getPaperDetails::paper_details: {}".format(paper_details))

            if paper_details.get("message", -1) != -1 or paper_details.get("error", -1) != -1:
                raise S2Error("Semantic Scholar API Error")
            
            paper_details["vertical_id"] = vertical_id
            paper_details["depth"] = depth
            paper_details["source"] = 'manual'
            paper_details["source_paper_id"] = paper_id

            paper_details["references"] = paper_details["references"][0:500]
            paper_details["citations"] = paper_details["citations"][0:500]
            
            return paper_details

        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getPaperDetails::SoftTimeLimitExceeded/S2Error")
            print("getPaperDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getPaperDetails::MaxRetriesExceededError")
                print("getPaperDetails::e: {}".format(e))

        except Exception as e:
            print("getPaperDetails::e: {}".format(e))
            print("getPaperDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperDetails::paper_details: {}".format(paper_details))


@celery.task(bind=True, rate_limit='1/s', soft_time_limit=60, max_retries=3, default_retry_delay=10)
def getPaperDetailsBulk(self, paper_details, sourced_from):
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

                if isinstance(papers, dict) and (papers.get("message", -1) != -1 or papers.get("message", -1) != -1):
                    print("getPaperDetailsBulk::papers: {}".format(papers))
                    raise S2Error("Semantic Scholar API Error")

                papers = [paper for paper in papers if paper != None]

                for paper in papers:
                    #print("getPaperDetailsBulk::paper:", papers)
                    paper['source_paper_id'] = source_paper_id
                    paper["vertical_id"] = vertical_id
                    paper["depth"] = depth
                    paper["source"] = sourced_from

                return papers

        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getPaperDetailsBulk::SoftTimeLimitExceeded/S2Error")
            print("getPaperDetailsBulk::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getPaperDetailsBulk::MaxRetriesExceededError")
                print("getPaperDetailsBulk::e: {}".format(e))

        except Exception as e:
            print("getPaperDetailsBulk::e: {}".format(e))
            print("getPaperDetailsBulk::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPaperDetailsBulk::response: {}".format(response))        


@celery.task(bind=True, rate_limit='10/s', soft_time_limit=60, max_retries=3, default_retry_delay=15)
def getAuthorDetails(self, paper_details):
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
                    params={'fields': 'url,name,aliases,affiliations,homepage,paperCount,citationCount,hIndex,papers.title,papers.url,papers.influentialCitationCount'},
                    json={'ids': author_ids[0:100]}
                )

                authors = response.json()

                if isinstance(authors, dict) and (authors.get("message", -1) != -1 or authors.get("message", -1) != -1):
                    print("getAuthorDetails::authors: {}".format(authors))
                    raise S2Error("Semantic Scholar API Error")
                
                authors = [author for author in authors if author != None]

                for author in authors:
                    author['source_papers'] = [{'id':paper_id, 'title': paper_details['title'], 'citationCount': paper_details['citationCount'], 'influentialCitationCount': paper_details['influentialCitationCount']}]
                    author["vertical_id"] = vertical_id
                    author["depth"] = depth     

                return authors
        
        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getAuthorDetails::SoftTimeLimitExceeded/S2Error")
            print("getAuthorDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getAuthorDetails::MaxRetriesExceededError")
                print("getAuthorDetails::e: {}".format(e))

        except Exception as e:
            print("getAuthorDetails::e: {}".format(e))
            print("getAuthorDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetails::response: {}".format(response))

    
@celery.task(bind=True, rate_limit='10/s', soft_time_limit=60, max_retries=3, default_retry_delay=15)
def getAuthorDetailsBulk(self, paper_details_bulk, vertical_id, depth):
    print("getAuthorDetailsBulk::getAuthorDetailsBulk API called")
    print("getAuthorDetailsBulk::paper_details_bulk: {}".format(paper_details_bulk))
    if paper_details_bulk != None and isinstance(paper_details_bulk, list):
        try:
            author_paper_mapping = {}
            for paper in paper_details_bulk:
                paper_id = paper['paperId']
                paper_title = paper['title']
                paper_citationCount = paper['citationCount']
                paper_influentialCitationCount = paper['influentialCitationCount']
                for author in paper['authors']:
                    author_id = author['authorId']
                    if author_paper_mapping.get(author_id, False) == False:
                        author_paper_mapping[author_id] = [{'id': paper_id, 'title': paper_title, 'citationCount': paper_citationCount, 'influentialCitationCount': paper_influentialCitationCount}]
                    else:
                        author_paper_mapping[author_id].append({'id': paper_id, 'title': paper_title, 'citationCount': paper_citationCount, 'influentialCitationCount': paper_influentialCitationCount})

            #print("getAuthorDetailsBulk::author_paper_mapping: ", author_paper_mapping)
            author_ids = list(author_paper_mapping.keys())

            if len(author_ids) > 0:
                print("getAuthorDetailsBulk::len(author_ids): ", len(author_ids))

                remaining_authors = len(author_ids)
                start = 0
                end = 1000
                all_authors = []
                while remaining_authors > 0:
                    response = requests.post(
                        "https://api.semanticscholar.org/graph/v1/author/batch",
                        headers=headers,
                        params={'fields': 'url,name,aliases,affiliations,homepage,paperCount,citationCount,hIndex'},#,papers
                        json={'ids': author_ids[start:end]}
                    )

                    authors = response.json()

                    if isinstance(authors, dict) and (authors.get("message", -1) != -1 or authors.get("error", -1) != -1):
                        print("getAuthorDetailsBulk::authors: {}".format(authors))
                        raise S2Error("Semantic Scholar API Error")

                    authors = [author for author in authors if author != None]

                    for author in authors:
                        # print("getAuthorDetailsBulk::author: {}".format(author))
                        author['source_papers'] = author_paper_mapping[author['authorId']]
                        author['verticalPaperCount'] = len(author_paper_mapping[author['authorId']])
                        author["vertical_id"] = vertical_id
                        author["depth"] = depth     

                    all_authors += authors
                    remaining_authors = remaining_authors - 1000
                    start = end
                    end = end + 1000

                return all_authors
            
        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getAuthorDetailsBulk::SoftTimeLimitExceeded/S2Error")
            print("getAuthorDetailsBulk::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getAuthorDetailsBulk::MaxRetriesExceededError")
                print("getAuthorDetailsBulk::e: {}".format(e))

        except Exception as e:
            print("getAuthorDetailsBulk::e: {}".format(e))
            print("getAuthorDetailsBulk::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetailsBulk::response: {}".format(response))
            

@celery.task(bind=True, soft_time_limit=180, max_retries=3, default_retry_delay=30)
def insertInDb(self, record, table):
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

        except SoftTimeLimitExceeded as e:
            print("insertInDb::SoftTimeLimitExceeded")
            print("insertInDb::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("insertInDb::MaxRetriesExceededError")
                print("insertInDb::e: {}".format(e))

        except Exception as e:
            print("insertInDb::e: {}".format(e))
            print("insertInDb::error_details: {}".format(traceback.format_exc()))
            print("insertInDb::table: {}".format(table))
            print("insertInDb::type(record): {}".format(type(record)))
            print("insertInDb::len(record): {}".format(len(record)))
            print("insertInDb::record: {}".format(record))


@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def update_vertical(self, id, status):
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
    
    except SoftTimeLimitExceeded as e:
            print("update_vertical::SoftTimeLimitExceeded")
            print("update_vertical::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("update_vertical::MaxRetriesExceededError")
                print("update_vertical::e: {}".format(e))

    except Exception as e:
        print("update_vertical::e: {}".format(e))
        print("update_vertical::error_details: {}".format(traceback.format_exc()))

@celery.task(soft_time_limit=60, autoretry_for=(SoftTimeLimitExceeded,), max_retries=3, default_retry_delay=10)
def getGrantsFromG2(vertical_id, query, numberOfGrants, generic_names, numberOfGrantsPerGenericName, opportunity_types):
    print('getGrantsFromG2::getGrantsFromG2 called')
    print('getGrantsFromG2:vertical_id: ', vertical_id)
    print('getGrantsFromG2::query: ', query)
    print('getGrantsFromG2::numberOfGrants: ', numberOfGrants)
    print('getGrantsFromG2::generic_names: ', generic_names)
    print('getGrantsFromG2::numberOfGrantsPerGenericName: ', numberOfGrantsPerGenericName)
    print('getGrantsFromG2::opportunity_types: ', opportunity_types)
    
    queries = {
        query: numberOfGrants
    }
    if numberOfGrantsPerGenericName > 0:
        for name in generic_names:
            queries[name] = numberOfGrantsPerGenericName

    print('getGrantsFromG2::queries: ', queries)

    task_chains = [
        chain(
            getGrants.s(vertical_id, query, num_results, opportunity_types),
            insertInDb.s('funding')
        ) for query, num_results in queries.items()
    ]

    chord(task_chains)(update_vertical.si(vertical_id, 'Completed'))

@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def getGrants(self, vertical_id, query, num_results, opportunity_types):
    try:
        print('getGrants::getGrants called')
        print('getGrants:vertical_id: ', vertical_id)
        print('getGrants::query: ', query)
        print('getGrants::num_results: ', num_results)
        print('getGrants::opportunity_types: ', opportunity_types)

        response = openai.Embedding.create(
            input= query,
            model="text-embedding-ada-002"
        )

        embedding = response.data[0].embedding
        query_results = index.query(embedding, top_k=num_results, include_metadata=True, filter={"type": {"$in":opportunity_types}})
        query_results = query_results.to_dict()
        for result in query_results['matches']:
            result['vertical_id'] = vertical_id
            result['search_term'] = query
        print("getGrants::query_results: {}".format(query_results))

        return query_results['matches']

    except Exception as e:
        print("getGrants::e: {}".format(e))
        print("getGrants::e::error_details: ", traceback.format_exc())

        try: 
            self.retry()

        except MaxRetriesExceededError as e:
            print("getGrants::MaxRetriesExceededError")
            print("getGrants::e: {}".format(e))
    

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
        getGrantsFromG2.delay(str(vertical_id), record['query'], record['numberOfGrants'], record['names'], record['numberOfGrantsPerGenericName'], record['OpportunityStatus'])
        # getPapersFromS2.delay(str(vertical_id), record['papers'])
    
    except Exception as e:
        print("createVertical::e: ", e)
        print("createVertical::e::error_details: ", traceback.format_exc())

    return record, 201

if __name__ == "__main__":
    app.run()

# getPapersFromS2.delay('6557a45d503f29770fd5b5c8', ["Atmospheric methane removal: a research agenda"])

# New Directions: Atmospheric methane removal as a way to mitigate climate change?
# Soft Robot Actuation Strategies for Locomotion in Granular Substrates
# Atmospheric methane removal: a research agenda
    
# getGrantsFromG2.delay('6557a45d503f29770fd5b5c8', 'methane removal from ambient air', [])
