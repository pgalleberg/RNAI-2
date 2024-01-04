
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
load_dotenv()


print("OPENAI_API_KEY: ", os.getenv("OPENAI_API_KEY"))
client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)


def fetch_data(file_name):
    url = 'https://prod-grants-gov-chatbot.s3.amazonaws.com/extracts/'

    if not os.path.exists(file_name):
        response = requests.get(url + file_name)
        if response.status_code == 200:
            with open(file_name, 'wb') as file:
                file.write(response.content)
                print("fetch_data::download completed")
            with zipfile.ZipFile(file_name, 'r') as zip_ref:
                zip_ref.extractall("./")
                print("fetch_data:extraction completed.")
        else:
            print("fetch_data::failed to retrieve the file")
    else:
        print("fetch_data::file already exists")


def process_data(file_name):
    opportunities = []
    tree = ET.parse(file_name)
    root = tree.getroot()
    namespaces = {'ns': 'http://apply.grants.gov/system/OpportunityDetail-V1.0'}
    parent_tags = ['ns:OpportunitySynopsisDetail_1_0', 'ns:OpportunityForecastDetail_1_0']

    for tag in parent_tags:
        for opp in root.findall(tag, namespaces):
            opportunity = {}
            for child in opp:
                opportunity[child.tag.split('}')[-1]] = child.text
            opportunities.append(opportunity)

    print('process_data::# of opportunities: ', len(opportunities))

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
        elif archive_date.isdigit() and datetime.strptime(archive_date, '%m%d%Y').date() >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif post_date.isdigit() and datetime.strptime(post_date, '%m%d%Y').date() + timedelta(days=180) >= datetime.now().date():
            future_opportunities.append(opportunity)
        elif estimated_synopsis_post_date.isdigit() and datetime.strptime(estimated_synopsis_post_date, '%m%d%Y').date() + timedelta(days=180) >= datetime.now().date():
            future_opportunities.append(opportunity)
        
        # check for non digits in both archive date and close date. case in point opp_id = 90013, 350882
        # add checks on the UI - to handle cases of non digit dates etc. 
        
    print('process_data::# of filtered opportunities: ', len(future_opportunities))

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
                print("create_embeddings::empty grants_batch received")
                i+=1
                num_tokens = 0
                grants_batch = []
                grants_records = []

    end_time = time.time()
    print("create_embeddings::total time = " + str((end_time-start_time)/60) + 'mins')
    create_batches(grants_to_insert)


def create_batches(grants):
    UPSERT_LIMIT = 200
    print("create_batches::number of total grants: ", len(grants))
    for i in range(0, len(grants), UPSERT_LIMIT):
        insert_to_db(grants[i:i+UPSERT_LIMIT])
        

def insert_to_db(records):
    max_attempts = 3
    attempts = 0

    while attempts < max_attempts:
        try:
            index.upsert(vectors = records)
            print("insert_to_db::batch inserted to database. # of records in batch: ", len(records))
            break
        except Exception as e:
            attempts+=1
            print("insert_to_db::attempt {} failed".format(attempts))
            print("insert_to_db::Exception::e: ", e)


def fetch_grants(query):
    response = client.embeddings.create(
        input= query,
        model="text-embedding-ada-002"
    )

    embedding = response.data[0].embedding
    query_results = index.query(embedding, top_k=3, include_metadata=True)
    print("fetch_grants::query_results:", query_results)


def delete_files():
    patterns = ['./*.zip', './*.xml']

    for pattern in patterns:
        for filename in glob.glob(pattern):
            os.remove(filename)
            print(f"delete_files::deleted {filename}")


def delete_and_create_index():
    try:
        pinecone.delete_index(INDEX_NAME)
        print("delete_and_create_index::deleted index")
    except Exception as e:
        print("delete_and_create_index::Exception::e: ", e)
    finally:
        pinecone.create_index("grants-gov", dimension=1536, metric="cosine")
        print("delete_and_create_index::created index")


current_date = datetime.now()
one_day_before = current_date - timedelta(days=1)
formatted_date = one_day_before.strftime("%Y%m%d")
print("current_date in YYYYMMDD format:", formatted_date)
file_name = 'GrantsDBExtract' + formatted_date + 'v2.zip'
print('file_name: ', file_name)

fetch_data(file_name)
grants = process_data(file_name.replace('.zip', '.xml'))

api_key = os.getenv("PINECONE_API_KEY")
env = 'gcp-starter'
pinecone.init(api_key=api_key, environment=env)
INDEX_NAME = 'grants-gov'
index = pinecone.Index(INDEX_NAME)

delete_and_create_index()
create_embeddings(grants)

# fetch_grants('methane removal from ambient air')

delete_files()