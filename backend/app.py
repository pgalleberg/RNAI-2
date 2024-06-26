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
from APIError import APIError
import pinecone
from openai import OpenAI
from datetime import date
from bs4 import BeautifulSoup
import tiktoken
import numpy as np

app = Flask(__name__)

app.config['DEBUG'] = True
app.config['CELERY_BROKER_URL'] = os.getenv("REDIS_CONN_STRING")
app.config['result_backend'] = os.getenv("REDIS_CONN_STRING")

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
client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

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

    numInitialPapers = 100
    papersChain = [
        chain(
            getRelevantPapers.s(vertical_id, record['query'], numInitialPapers),
            getMostRelevantPapers.s(record['query'], record['numberOfRelevantPapers']),
            group(
                [insertInDb.s('papers')] + 
                [chain(
                    getAuthorDetails.s(index=i),
                    insertInDb.s('authors')
                ) for i in range(record['numberOfRelevantPapers'])]
            ),
            papers_check.si('Completed')
        )
    ]

    patentsChain = [
        chain(
            getPatents.s(vertical_id, record["query"], record['numberOfPatents']),
            group(
                chain(
                    getPatentDetails.s(index=i),
                    group(
                        insertInDb.s("patents"),
                        chain(
                            getInventorDetails.s(vertical_id),
                            insertInDb.s("inventors")
                        )
                    )
                ) for i in range(record["numberOfPatents"])
            ),
            patents_check.si('Completed')
        )
    ]

    workflow = group(grantsChain + papersChain + patentsChain)
    chord(workflow)(update_vertical.si(vertical_id, 'Completed'))


def num_tokens_from_string(string: str, encoding_name: str):
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@celery.task(bind=True, max_retries=3, default_retry_delay=10) #rate_limit='10/s', soft_time_limit=60, 
def getMostRelevantPapers(self, papers, query, num_results):
    print("getMostRelevantPapers::getMostRelevantPapers API called")
    print("getMostRelevantPapers::len(papers): {}".format(len(papers)))
    # create embeddings
    i = 0
    num_tokens = 0
    papers_batch = []
    papers_records = []
    index = 0
    while i < len(papers):
        print("getMostRelevantPapers::Title: {}".format(papers[i]['title']))
        print("getMostRelevantPapers::Abstract: {}".format(papers[i]['abstract']))
        if papers[i]['abstract']:
            paper_formatted = 'Title: ' + papers[i]['title'] + "\nAbstract: " + papers[i]['abstract']
        else:
            print("getMostRelevantPapers::abstract not found for paper {}".format(papers[i]['title']))
            paper_formatted = 'Title: ' + papers[i]['title']
            
        num_tokens += num_tokens_from_string(paper_formatted, "cl100k_base")
    
        if num_tokens <= 8192:
            papers_batch.append(paper_formatted)
            print("getMostRelevantPapers::paper {} appended to batch".format(paper_formatted))
            papers_records.append(papers[i])
            i+=1
        
        if num_tokens > 8192 or i == len(papers):
            if papers_batch != []: 
                response = client.embeddings.create(
                    input=papers_batch,
                    model="text-embedding-3-small"
                )

                for object in response.data:
                    print("getMostRelevantPapers::index: {}".format(index))
                    papers_records[index]['values'] = object.embedding
                    index+=1
                
                num_tokens = 0
                papers_batch = []
            else:
                print("getMostRelevantPapers::empty papers_batch received")
                i+=1
                num_tokens = 0
                papers_batch = []
                

    # calculate cosine similarity
    response = client.embeddings.create(
        input= query,
        model="text-embedding-3-small"
    )

    embedding = response.data[0].embedding
    for paper in papers_records:
        print("getMostRelevantPapers::paper title: {} processed".format(paper['title']))
        paper['score'] = cosine_similarity(paper['values'], embedding)       

    # get the top cosine similarity scores
    sorted_data = sorted(papers_records, key=lambda x: x['score'], reverse=True)

    for data in sorted_data:
        data.pop('values', None)

    return sorted_data[0:num_results]


@celery.task(bind=True, max_retries=3, default_retry_delay=30, soft_time_limit=120)
def getPatents(self, vertical_id, query, num_relevant_patents):
    print("getPatents::getPatents API called")

    try:
        url = f"https://serpapi.com/search.json?engine=google_patents&q={query}&num={num_relevant_patents}&api_key={serp_api_key}"
        response = requests.get(url).json()
        
        if response["search_metadata"]["status"] == "Error":
            raise APIError(response["search_metadata"]["error"])
        
        patents = response["organic_results"]
        
        for patent in patents:
            patent["vertical_id"] = vertical_id

        return patents

    except (SoftTimeLimitExceeded, APIError) as e:
        print("getPatents::SoftTimeLimitExceeded/APIError")
        print("getPatents::e: {}".format(e))

        try: 
            self.retry()

        except MaxRetriesExceededError as e:
            print("getPatents::MaxRetriesExceededError")
            print("getPatents::e: {}".format(e))

            return -1

    except Exception as e:
        print("getPatents::e: {}".format(e))
        print("getPatents::error_details: {}".format(traceback.format_exc()))
        if (isinstance(e, KeyError)):
            print("getPatents::response: {}".format(response))
        
        return -1


@celery.task(bind=True, max_retries=3, default_retry_delay=30, soft_time_limit=120)
def getPatentDetails(self, patents, index):
    print("getPatentDetails::getPatentDetails API called")
    if patents != -1:
        patent = patents[index]
        try:
            response = requests.get(patent["serpapi_link"]+f"&api_key={serp_api_key}")
            patent_detail = response.json()
            if patent_detail["search_metadata"]["status"] == "Error":
                raise APIError(patent_detail["search_metadata"]["error"])
            
            if patent_detail.get("description_link", None):
                description = requests.get(patent_detail["description_link"])
                soup = BeautifulSoup(description.content, "html.parser")
                body_content = soup.find('body')
                if body_content:
                    patent_detail["description"] = body_content.text
            
            patent_detail["vertical_id"] = patent["vertical_id"]
            # response["patent_id"] = str(uuid4())
            patent_detail["rank"] = patent["rank"]
            patent_detail["patent_id"] = patent_detail["search_parameters"]["patent_id"]
            return patent_detail
        
        except (SoftTimeLimitExceeded, APIError) as e:
            print("getPatentDetails::SoftTimeLimitExceeded/APIError")
            print("getPatentDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getPatentDetails::MaxRetriesExceededError")
                print("getPatentDetails::e: {}".format(e))

                return -1

        except Exception as e:
            print("getPatentDetails::e: {}".format(e))
            print("getPatentDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getPatentDetails::response: {}".format(response))
            
            return -1
    else:
        return -1

    


@celery.task(bind=True, max_retries=3, default_retry_delay=30, soft_time_limit=120)
def getInventorDetails(self, patent_details, vertical_id):
    print("getInventorDetails::getInventorDetails API called")
    if patent_details != -1:
        try:
            inventors = []
            for inventor in patent_details["inventors"]:
                response = requests.get(inventor["serpapi_link"]+f"&api_key={serp_api_key}")
                inventor_details = response.json()

                if inventor_details["search_metadata"]["status"] == "Error":
                    raise APIError(inventor_details["search_metadata"]["error"])
                
                inventor_details["vertical_id"] = vertical_id
                inventor_details["source_patents"] = [{"title": patent_details["title"], "patent_id": patent_details["patent_id"]}]
                inventor_details["name"] = inventor["name"]
                inventors.append(inventor_details)
            
            return inventors
            
        except (SoftTimeLimitExceeded, APIError) as e:
            print("getInventorDetails::SoftTimeLimitExceeded/APIError")
            print("getInventorDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getInventorDetails::MaxRetriesExceededError")
                print("getInventorDetails::e: {}".format(e))

                return -1

        except Exception as e:
            print("getInventorDetails::e: {}".format(e))
            print("getInventorDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getInventorDetails::response: {}".format(response))
            
            return -1
    else:
        return -1
    


@celery.task(bind=True, rate_limit='1/s', soft_time_limit=120, max_retries=3, default_retry_delay=10)
def getRelevantPapers(self, vertical_id, query, num_relevant_papers):
    print("getRelevantPapers::getRelevantPapers API called")
    try:
        url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + query + "&limit=" + str(num_relevant_papers) + "&fields=url,title,venue,publicationVenue,year,authors,abstract,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,tldr,citations,references"
        print("getRelevantPapers::sending request to url: {}".format(url))
        response = requests.get(url, headers=headers).json()
        # print('getRelevantPapers::response: {}'.format(response))

        if response.get("message", -1) != -1 or response.get("error", -1) != -1:
            raise APIError("Semantic Scholar API Error")

        papers = response['data']
        for index, paper in enumerate(papers):
            paper['vertical_id'] = vertical_id
            paper['rank'] = index
        print('getRelevantPapers::papers: ', papers)
        return papers
        
    except (SoftTimeLimitExceeded, APIError) as e:
        print("getRelevantPapers::SoftTimeLimitExceeded/APIError")
        print("getRelevantPapers::e: {}".format(e))
        print("getRelevantPapers::response: {}".format(response))

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
                url = "https://api.semanticscholar.org/graph/v1/paper/" + paper_id + "/authors?fields=url,name,affiliations,homepage,paperCount,citationCount,hIndex,papers.title,papers.url,papers.influentialCitationCount"
                print("getAuthorDetails::sending request to url: {}".format(url))
                response = requests.get(url, headers=headers)
                authors = response.json()
                # print("getAuthorDetails::authors: {}".format(authors))

                if authors.get("message", -1) != -1 or authors.get("error", -1) != -1:
                    print("getAuthorDetails::authors: {}".format(authors))
                    raise APIError("Semantic Scholar API Error")
                
                authors = [author for author in authors['data'] if author != None]

                for author in authors:
                    author['source_papers'] = [{'id':paper_id, 'title': paper_details['title'], 'citationCount': paper_details['citationCount'], 'influentialCitationCount': paper_details['influentialCitationCount']}]
                    author["vertical_id"] = vertical_id
                    # author["depth"] = depth     

                print("getAuthorDetails::authors: {}".format(authors))
                return authors
        
        except (SoftTimeLimitExceeded, APIError) as e:
            print("getAuthorDetails::SoftTimeLimitExceeded/APIError")
            print("getAuthorDetails::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("getAuthorDetails::MaxRetriesExceededError")
                print("getAuthorDetails::e: {}".format(e))

                #TODO: No return statement here. Should there be?
                return -1

        except Exception as e:
            print("getAuthorDetails::e: {}".format(e))
            print("getAuthorDetails::error_details: {}".format(traceback.format_exc()))
            if (isinstance(e, KeyError)):
                print("getAuthorDetails::response: {}".format(response))
            
            #TODO: No return statement here. Should there be?
            return -1
    
    else:
        return -1
            

@celery.task(bind=True, soft_time_limit=180, max_retries=3, default_retry_delay=30)
def insertInDb(self, record, table):
    if record != None:
        try:
            collection = db[table]
            print("insertInDb::table: {}".format(table))

            if isinstance(record, dict):
                collection.insert_one(record)
                return 1

            elif isinstance(record, list):
                # remove all nones. Catering to record = [None, None] & record = [None, [{}, ...]]
                record = [rec for rec in record if rec != None]

                # if 2d list then pass only the last index. Catering to record = [None, [{}, ...]] => [[{}, ...]]
                if len(record) > 0 and isinstance(record[0], list):
                    record = record[0]
               
                if len(record) > 0:
                    collection.insert_many(record)
                
                return 1

        except SoftTimeLimitExceeded as e:
            print("insertInDb::SoftTimeLimitExceeded")
            print("insertInDb::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("insertInDb::MaxRetriesExceededError")
                print("insertInDb::e: {}".format(e))
                return -1

        except Exception as e:
            print("insertInDb::e: {}".format(e))
            print("insertInDb::error_details: {}".format(traceback.format_exc()))
            print("insertInDb::table: {}".format(table))
            print("insertInDb::type(record): {}".format(type(record)))
            print("insertInDb::len(record): {}".format(len(record)))
            print("insertInDb::record: {}".format(record))
            return -1
    
    else:
        return -1


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
        return 1
    
    except SoftTimeLimitExceeded as e:
            print("update_vertical::SoftTimeLimitExceeded")
            print("update_vertical::e: {}".format(e))

            try: 
                self.retry()

            except MaxRetriesExceededError as e:
                print("update_vertical::MaxRetriesExceededError")
                print("update_vertical::e: {}".format(e))
                return -1

    except Exception as e:
        print("update_vertical::e: {}".format(e))
        print("update_vertical::error_details: {}".format(traceback.format_exc()))
        return -1


@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def grants_check(self, status):
    print("grants_check::status: {}".format(status))
    return 1

@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def patents_check(self, status):
    print("patents_check::status: {}".format(status))
    return 1

@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def papers_check(self, status):
    print("papers_check::status: {}".format(status))
    return 1


@celery.task(bind=True, soft_time_limit=60, max_retries=3, default_retry_delay=10)
def getGrants(self, vertical_id, query, num_results, opportunity_types):
    try:
        print('getGrants::getGrants called')
        print('getGrants:vertical_id: ', vertical_id)
        print('getGrants::query: ', query)
        print('getGrants::num_results: ', num_results)
        print('getGrants::opportunity_types: ', opportunity_types)

        response = client.embeddings.create(
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

            if 'CloseDate' in result['metadata'] and type(result['metadata']['CloseDate']) is date:   
                result['metadata']['CloseDate'] = result['metadata']['CloseDate'].strftime('%Y-%m-%d')
            
            if 'PostDate' in result['metadata'] and type(result['metadata']['PostDate']) is date:   
                result['metadata']['PostDate'] = result['metadata']['PostDate'].strftime('%Y-%m-%d')
            
            if 'LastUpdatedDate' in result['metadata'] and type(result['metadata']['LastUpdatedDate']) is date:   
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
            return -1


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

# task = {
#     "query": "methane removal from ambient air",
#     "status": "Pending",
#     "numberOfGrants": 10,
#     "numberOfGrantsPerGenericName": 0, 
#     "numberOfRelevantPapers": 10,
#     "numberOfPatents": 10,
#     'OpportunityStatus': ["posted", "forecasted"]
# }
# getData.delay('6557a45d503f29770fd5b5c8', task)
