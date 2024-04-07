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
from datetime import date

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
serp_api_key = os.getenv("SERP_API_KEY")
headers = {
    'x-api-key': s2_api_key
}

pinecone_api_key = os.getenv("PINECONE_API_KEY")
env = 'gcp-starter'
pinecone.init(api_key=pinecone_api_key, environment=env)
index_name = 'grants'
index = pinecone.Index(index_name)


@celery.task(soft_time_limit=60, autoretry_for=(SoftTimeLimitExceeded,), max_retries=3, default_retry_delay=10) #name='__main__.tasks.getPapersFromS2'
def getData(vertical_id, record):
    print('getData::getData called')

    queries = {
        record['query']: record['numberOfGrants']
    }
    if record['numberOfGrantsPerGenericName'] > 0:
        for name in record['names']:
            queries[name] = record['numberOfGrantsPerGenericName']

    print('getData::queries: ', queries)

    grantsChain = [
        chain(
            getGrants.s(vertical_id, query, num_results, record['OpportunityStatus']),
            insertInDb.s('funding')
        ) for query, num_results in queries.items()
    ] 

    papersChain = [
        chain(
            getRelevantPapers.s(vertical_id, record['query'], record['numberOfRelevantPapers']),
            group(
                [insertInDb.s('papers')] + 
                [chain(
                    getAuthorDetails.s(index=i),
                    insertInDb.s('authors')
                ) for i in range(record['numberOfRelevantPapers'])]
            )
        )
    ]
    patentsChain = [
        chain(
            getPatents.s(vertical_id, record["query"], record['numberOfPatents']),
            group(
                [insertInDb.s("patents")] + 
                [chain(
                    getPatentDetail.s(vertical_id),
                    group(
                        insertInDb.s("patentDetails"),
                        chain(
                            getInventorDetail.s(vertical_id),
                            insertInDb.s("inventorDetails")
                        )
                    )
                )] 
            )
            
        )
    ]

    workflow = group(grantsChain + papersChain + patentsChain)
    chord(workflow)(update_vertical.si(vertical_id, 'Completed'))

@celery.task(bind=True, max_retries=3, defauly_retry_delay=10)
def getPatentDetail(self, patents, vertical_id):
    print("getPatentDetails::getPatentDEtails API called")
    from bs4 import BeautifulSoup
    patentDetails = []
    for patent in patents:
        try:
            response = requests.get(patent["serpapi_link"]+f"&api_key={serp_api_key}").json()
            if response["search_metadata"]["status"] == "Error":
                raise response["search_metadata"]["error"]
            response["vertical_id"] = vertical_id
            if response.get("description_link", None):
                description = requests.get(response["description_link"])
                soup = BeautifulSoup(description.content, "html.parser")
                body_content = soup.find('body')
                if body_content:
                    response["description"] = body_content.text
            patentDetails.append(response)
        except Exception as e:
            print("getPatentDetail::e: {}".format(e))
    return patentDetails


@celery.task(bind=True, rate_limit='1/s', soft_time_limit=120, max_retries=3, default_retry_delay=10)
def getRelevantPapers(self, vertical_id, query, num_relevant_papers):
    print("getRelevantPapers::getRelevantPapers API called")
    try:
        url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + query + "&limit=" + str(num_relevant_papers) + "&fields=url,title,venue,publicationVenue,year,authors,abstract,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,tldr,citations,references"
        print("getRelevantPapers::sending request to url: {}".format(url))
        response = requests.get(url, headers=headers).json()
        # print('getRelevantPapers::response: {}'.format(response))

        if response.get("message", -1) != -1 or response.get("error", -1) != -1:
            raise S2Error("Semantic Scholar API Error")

        papers = response['data']
        for index, paper in enumerate(papers):
            paper['vertical_id'] = vertical_id
            paper['rank'] = index
        print('getRelevantPapers::papers: ', papers)
        return papers
        
    except (SoftTimeLimitExceeded, S2Error) as e:
        print("getRelevantPapers::SoftTimeLimitExceeded/S2Error")
        print("getRelevantPapers::e: {}".format(e))

        try: 
            self.retry()

        except MaxRetriesExceededError as e:
            print("getRelevantPapers::MaxRetriesExceededError")
            print("getRelevantPapers::e: {}".format(e))

            return -1 #TODO:what happens if I dont return anything?? What exactly happens if you return something or you don't?

    
    except Exception as e:
        print("getRelevantPapers::e: {}".format(e))
        print("getRelevantPapers::error_details: {}".format(traceback.format_exc()))
        if (isinstance(e, KeyError)):
            print("getRelevantPapers::response: {}".format(response))
        
        return -1 #TODO:what happens if I dont return anything?? What exactly happens if you return something or you don't?

@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def getInventorDetail(self, patent_details, vertical_id):
    print("getInventorDetail::getInventordetail api called.")
    data = []
    for patent_detail in patent_details:
        for inventor in patent_detail["inventors"]:
            try:
                response = requests.get(inventor["serpapi_link"]+f"&api_key={serp_api_key}").json()
                if response["search_metadata"]["status"] == "Error":
                    raise response["search_metadata"]["error"]
                if response.get("organic_results", None):
                    inventor_data = {}
                    inventor_data["name"] = inventor 
                    inventor_data["patents"] = response["organic_results"]
                    inventor_data["vertical_id"] = vertical_id
                    inventor_data["publication_number"] = patent_detail["publication_number"]
                    inventor_data["source_patent"] = patent_detail
                    data.append(inventor_data)
            except Exception as e:
                print("getinventordetail::e::{}".format(e))
    print("getInventorDetail::exiting")
    return data

@celery.task(bind=True, rate_limit='10/s', soft_time_limit=60, max_retries=3, default_retry_delay=10)
def getAuthorDetails(self, paper_details, index):
    print("getAuthorDetails::getAuthorDetails API called")
    # print("getAuthorDetails::paper_details: {}".format(paper_details))
    if paper_details != None and paper_details != -1:  #TODO: Empty return in case it goes to else here
        try:
            paper_details = paper_details[index]
            authors = paper_details['authors']
            author_ids = [author['authorId'] for author in authors]
            paper_id = paper_details['paperId']
            vertical_id = paper_details["vertical_id"]
            # depth = paper_details["depth"]
            
            if len(author_ids) > 0: #TODO: Empty return in case it goes to else here
                url = "https://api.semanticscholar.org/graph/v1/paper/" + paper_id + "/authors?fields=url,name,aliases,affiliations,homepage,paperCount,citationCount,hIndex,papers.title,papers.url,papers.influentialCitationCount"
                print("getAuthorDetails::sending request to url: {}".format(url))
                response = requests.get(url, headers=headers)
                authors = response.json()
                # print("getAuthorDetails::authors: {}".format(authors))

                if authors.get("message", -1) != -1 or authors.get("error", -1) != -1:
                    print("getAuthorDetails::authors: {}".format(authors))
                    raise S2Error("Semantic Scholar API Error")
                
                authors = [author for author in authors['data'] if author != None]

                for author in authors:
                    author['source_papers'] = [{'id':paper_id, 'title': paper_details['title'], 'citationCount': paper_details['citationCount'], 'influentialCitationCount': paper_details['influentialCitationCount']}]
                    author["vertical_id"] = vertical_id
                    # author["depth"] = depth     

                print("getAuthorDetails::authors: {}".format(authors))
                return authors
        
        except (SoftTimeLimitExceeded, S2Error) as e:
            print("getAuthorDetails::SoftTimeLimitExceeded/S2Error")
            print("getAuthorDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getAuthorDetails::MaxRetriesExceededError")
                print("getAuthorDetails::e: {}".format(e))

                #TODO: No return statement here. Should there be?

        except Exception as e:
            print("getAuthorDetails::e: {}".format(e))
            print("getAuthorDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetails::response: {}".format(response))
            
            #TODO: No return statement here. Should there be?

@celery.task(bind=True, soft_time_limit=100, max_retries=3, default_retry_delay=30)
def getPatents(self, vertical_id, query, min_relevant_patents):
    print("getPatents::getPatents API called")
    
    try:
        url = f"https://serpapi.com/search.json?engine=google_patents&q={query}&num={min_relevant_patents}&api_key={serp_api_key}"

        response = requests.get(url)
        print("resp", response)
        response = response.json()
        if response["search_metadata"]["status"] == "Error":
            raise response["search_metadata"]["error"]
        data = response["organic_results"]
        for _, entity in enumerate(data):
            entity["vertical_id"] = vertical_id
        
        return data

    except Exception as e:
        print("getPatents::e: {}".format(e))
        print("getPatents::e: {}".format("API has been consumed completely."))
        return []
            

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
            model="text-embedding-3-small"
        )

        embedding = response.data[0].embedding
        query_results = index.query(embedding, top_k=num_results, include_metadata=True) #, filter={"type": {"$in":opportunity_types}}
        print("getGrants::query_results initial: {}".format(query_results))
        query_results = query_results.to_dict()
        for result in query_results['matches']:
            result['vertical_id'] = vertical_id
            result['search_term'] = query

            if type(result['metadata']['CloseDate']) is date:  
                result['metadata']['CloseDate'] = result['metadata']['CloseDate'].strftime('%Y-%m-%d')
            
            if type(result['metadata']['PostDate']) is date:  
                result['metadata']['PostDate'] = result['metadata']['PostDate'].strftime('%Y-%m-%d')
            
            if type(result['metadata']['LastUpdatedDate']) is date:  
                result['metadata']['LastUpdatedDate'] = result['metadata']['LastUpdatedDate'].strftime('%Y-%m-%d')

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


@app.route('/api/tasks', methods=['POST'])
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

        getData.delay(str(vertical_id), record)
    
    except Exception as e:
        print("createVertical::e: ", e)
        print("createVertical::e::error_details: ", traceback.format_exc())

    return record, 201

if __name__ == "__main__":
    app.run()


# getPapersFromS2.delay('6557a45d503f29770fd5b5c8', "methane removal from ambient air", 5)    
# getGrantsFromG2.delay('6557a45d503f29770fd5b5c8', 'methane removal from ambient air', [])
