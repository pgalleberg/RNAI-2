from openai import OpenAI
import pinecone
# from main import INDEX_NAME, pinecone, index, client
import tiktoken
import glob
import os
from logger_config import configure_logger
from celery import Celery
from dotenv import load_dotenv
load_dotenv()

celery = Celery('celery_app', broker='redis://localhost:6379/1')

logger = configure_logger(__name__)

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

api_key = os.getenv("PINECONE_API_KEY")
env = 'gcp-starter'
pinecone.init(api_key=api_key, environment=env)
INDEX_NAME = 'grants'
index = pinecone.Index(INDEX_NAME)

def delete_and_create_index():
    try:
        pinecone.delete_index(INDEX_NAME)
        logger.info("deleted index")
    except Exception as e:
        logger.info("Exception::e: {}".format(e))
    finally:
        pinecone.create_index(INDEX_NAME, dimension=1536, metric="cosine")
        logger.info("created index")


def create_batches(grants):
    UPSERT_LIMIT = 200
    logger.info("number of total grants: {}".format(len(grants)))
    for i in range(0, len(grants), UPSERT_LIMIT):
        insert_to_db.delay(grants[i:i+UPSERT_LIMIT])
        
        
@celery.task
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


def num_tokens_from_string(string: str, encoding_name: str):
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


def fetch_grants(query, source):
    logger.info("Fetching grants for {} from {}".format(query, source))
    response = client.embeddings.create(
        input= query,
        model="text-embedding-3-small"
    )

    embedding = response.data[0].embedding
    query_results = index.query(embedding, top_k=3, include_metadata=True, filter={"source": {"$in":[source]}})
    logger.info("query_results: {}".format(query_results))


def delete_files():
    patterns = ['./data/*.zip', './data/*.xml', './data/*.csv', './data/*.crdownload']

    for pattern in patterns:
        for filename in glob.glob(pattern):
            os.remove(filename)
            logger.info("deleted {}".format(filename))