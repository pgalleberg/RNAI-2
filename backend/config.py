from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # This loads the environment variables from .env

client = MongoClient(os.getenv("DB_CONN_STRING"))
db = client[os.getenv("DATABASE")]