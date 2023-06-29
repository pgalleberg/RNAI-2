from scholarly import scholarly
from scholarly import ProxyGenerator
from fp.fp import FreeProxy
import requests
from bs4 import BeautifulSoup

import time
from tqdm import tqdm
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
ca = certifi.where()

class RNAI:

    def __init__(self):
        self.parameters = {'iterations': 10, 'citations': 100, 'wait_time': 25}

        self.initialise_database(reset_database = True)

    def initialise_database(self):
        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

        self.db = self.mongo_client.rnai

        for vertical in self.db.verticals.find({}):

            print(vertical)

            sgs
