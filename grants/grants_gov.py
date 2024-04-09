import os
from openai import OpenAI
from datetime import datetime, timedelta
import zipfile
import requests
import html
import xml.etree.ElementTree as ET
import time
from dotenv import load_dotenv
load_dotenv()
from utils import create_batches, num_tokens_from_string, delete_and_create_index, delete_files, fetch_grants
from logger_config import configure_logger

logger = configure_logger(__name__)

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

def fetch_data(directory, file_name):
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


def process_data(directory, file_name):
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
            grants[i]['source'] = "grants.gov"
            grants_records.append({
                'id': grants[i]['OpportunityID'],
                'metadata': grants[i]
            })
            i+=1
        
        if num_tokens > 8192 or i == len(grants):
            if grants_batch != []: 
                response = client.embeddings.create(
                    input=grants_batch,
                    model="text-embedding-3-small"
                )

                for index, object in enumerate(response.data):
                    grants_records[index]['values'] = object.embedding
                
                # insert_to_db(grants_records)
                # grants_to_insert+=grants_records
                create_batches(grants_records)
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

    # create_batches(grants_to_insert)
    end_time = time.time()
    logger.info("total time: {} mins".format((end_time-start_time)/60))


def get_grants_grants_gov():
    current_date = datetime.now()
    one_day_before = current_date - timedelta(days=1)
    formatted_date = one_day_before.strftime("%Y%m%d")
    logger.info("current_date in YYYYMMDD format: {}".format(formatted_date))
    file_name = 'GrantsDBExtract' + formatted_date + 'v2.zip'
    logger.info('file_name: {}'.format(file_name))
    directory = './data/'

    fetch_data(directory, file_name)
    grants = process_data(directory, file_name.replace('.zip', '.xml'))
    # delete_and_create_index()
    create_embeddings(grants)
    # fetch_grants('methane removal from ambient air')
    # delete_files()