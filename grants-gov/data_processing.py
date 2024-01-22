
import requests
from datetime import datetime, timedelta
import zipfile
import xml.etree.ElementTree as ET
import pandas as pd
import tiktoken
from openai import OpenAI
import pinecone
import os
import glob
import html
import time
from dotenv import load_dotenv
import logging
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(funcName)s::%(message)s')
logger = logging.getLogger(__name__)
file_handler = logging.FileHandler('./logs/grants-gov.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter('%(asctime)s %(funcName)s::%(message)s'))
logger.addHandler(file_handler)

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)


def fetch_data(file_name):
    url = 'https://prod-grants-gov-chatbot.s3.amazonaws.com/extracts/'

    if not os.path.exists(directory + file_name):
        response = requests.get(url + file_name)
        if response.status_code == 200:
            with open(directory + file_name, 'wb') as file:
                file.write(response.content)
                logger.info("download completed")
            with zipfile.ZipFile(directory + file_name, 'r') as zip_ref:
                zip_ref.extractall("./" + directory)
                logger.info("extraction completed")
        else:
            logger.info("failed to retrieve the file")
    else:
        logger.info("file already exists")


def process_data(file_name):
    opportunities = []
    tree = ET.parse(directory + file_name)
    root = tree.getroot()
    namespaces = {'ns': 'http://apply.grants.gov/system/OpportunityDetail-V1.0'}
    parent_tags = ['ns:OpportunitySynopsisDetail_1_0', 'ns:OpportunityForecastDetail_1_0']

    for tag in parent_tags:
        for opp in root.findall(tag, namespaces):
            opportunity = {}
            opportunity['type'] = 'posted' if tag == 'ns:OpportunitySynopsisDetail_1_0' else 'forecasted'
            for child in opp:
                opportunity[child.tag.split('}')[-1]] = child.text
            opportunities.append(opportunity)

    logger.info('# of opportunities: {}'.format(len(opportunities)))

    future_opportunities = []
    for opportunity in opportunities:
        archive_date = opportunity.get('ArchiveDate', '')
        close_date = opportunity.get('CloseDate', '')
        estimated_synopsis_close_date = opportunity.get('EstimatedSynopsisCloseDate', '')
        post_date = opportunity.get('PostDate', '')
        estimated_synopsis_post_date = opportunity.get('EstimatedSynopsisPostDate', '')

        if close_date.isdigit() and datetime.strptime(close_date, '%m%d%Y').date() >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif estimated_synopsis_close_date.isdigit() and datetime.strptime(estimated_synopsis_close_date, '%m%d%Y').date() >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif not close_date.isdigit() and not estimated_synopsis_close_date.isdigit() and archive_date.isdigit() and datetime.strptime(archive_date, '%m%d%Y').date() >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif not close_date.isdigit() and not estimated_synopsis_close_date.isdigit() and not archive_date.isdigit() and post_date.isdigit() and datetime.strptime(post_date, '%m%d%Y').date() + timedelta(days=180) >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif not estimated_synopsis_close_date.isdigit() and not archive_date.isdigit() and estimated_synopsis_post_date.isdigit() and datetime.strptime(estimated_synopsis_post_date, '%m%d%Y').date() + timedelta(days=180) >= datetime.now().date():
            future_opportunities.append(opportunity)
        
        # check for non digits in both archive date and close date. case in point opp_id = 90013, 350882
        # add checks on the UI - to handle cases of non digit dates etc. 
        
    logger.info('# of filtered opportunities: {}'.format(len(future_opportunities)))

    for opportunity in future_opportunities:
        for key, value in opportunity.items():
            unescaped_text = html.unescape(value)
            updated_text = unescaped_text.replace("<br/>", "\n")
            opportunity[key] = updated_text

    return future_opportunities


def num_tokens_from_string(string: str, encoding_name: str):
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


def create_embeddings(grants):
    start_time = time.time()
    num_tokens = 0
    grants_batch = []
    grants_records = []
    grants_to_insert = []

    i = 0
    num_tokens = 0
    while i < len(grants):
        grant_formatted = 'Title: ' + grants[i]['OpportunityTitle'] + "\nDescription: " + grants[i]['Description']
        num_tokens += num_tokens_from_string(grant_formatted, "cl100k_base")
        
        if num_tokens <= 8192:
            grants_batch.append(grant_formatted)
            grants_records.append({
                'id': grants[i]['OpportunityID'],
                'metadata': grants[i]
            })
            i+=1
        
        if num_tokens > 8192 or i == len(grants):
            if grants_batch != []: 
                response = client.embeddings.create(
                    input=grants_batch,
                    model="text-embedding-ada-002"
                )

                for index, object in enumerate(response.data):
                    grants_records[index]['values'] = object.embedding
                
                # insert_to_db(grants_records)
                grants_to_insert+=grants_records
                
                # i-=1 # so that we process the current item which caused us to go above 8192 again. 
                num_tokens = 0
                grants_batch = []
                grants_records = []
            else:
                logger.info("empty grants_batch received")
                i+=1
                num_tokens = 0
                grants_batch = []
                grants_records = []

    end_time = time.time()
    logger.info("total time: {} mins".format((end_time-start_time)/60))
    create_batches(grants_to_insert)


def create_batches(grants):
    UPSERT_LIMIT = 200
    logger.info("number of total grants: {}".format(len(grants)))
    for i in range(0, len(grants), UPSERT_LIMIT):
        insert_to_db(grants[i:i+UPSERT_LIMIT])
        

def insert_to_db(records):
    max_attempts = 3
    attempts = 0

    while attempts < max_attempts:
        try:
            index.upsert(vectors = records)
            logger.info("batch inserted to database. # of records in batch: {}".format(len(records)))
            break
        except Exception as e:
            attempts+=1
            logger.info("attempt {} failed".format(attempts))
            logger.info("Exception::e: {}".format(e))


def fetch_grants(query):
    response = client.embeddings.create(
        input= query,
        model="text-embedding-ada-002"
    )

    embedding = response.data[0].embedding
    query_results = index.query(embedding, top_k=3, include_metadata=True)
    logger.info("query_results: {}".format(query_results))


def delete_files():
    patterns = ['./data/*.zip', './data/*.xml']

    for pattern in patterns:
        for filename in glob.glob(pattern):
            os.remove(filename)
            logger.info("deleted {}".format(filename))


def delete_and_create_index():
    try:
        pinecone.delete_index(INDEX_NAME)
        logger.info("deleted index")
    except Exception as e:
        logger.info("Exception::e: {}".format(e))
    finally:
        pinecone.create_index("grants-gov", dimension=1536, metric="cosine")
        logger.info("created index")


current_date = datetime.now()
# one_day_before = current_date - timedelta(days=1)
formatted_date = current_date.strftime("%Y%m%d")
logger.info("current_date in YYYYMMDD format: {}".format(formatted_date))
file_name = 'GrantsDBExtract' + formatted_date + 'v2.zip'
logger.info('file_name: {}'.format(file_name))
directory = './data/'

fetch_data(file_name)
grants = process_data(file_name.replace('.zip', '.xml'))

api_key = os.getenv("PINECONE_API_KEY")
env = 'gcp-starter'
pinecone.init(api_key=api_key, environment=env)
INDEX_NAME = 'grants-gov'
index = pinecone.Index(INDEX_NAME)

delete_and_create_index()
create_embeddings(grants)

fetch_grants('methane removal from ambient air')

delete_files()