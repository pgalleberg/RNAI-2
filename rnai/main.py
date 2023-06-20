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

pg = ProxyGenerator()
pg.FreeProxies()
scholarly.use_proxy(pg)

class RNAI:

    def __init__(self):
        #self.proxy_gen = ProxyGenerator()
        #self.proxy_gen.FreeProxies()
        #scholarly.use_proxy(self.proxy_gen)

        self.parameters = {'iterations': 10, 'citations': 100, 'wait_time': 25}

        self.initialise_database(reset_database = True)

    def initialise_database(self, reset_database = False):
        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

        self.db = self.mongo_client.rnai

        if reset_database is True:
            for coll in self.db.list_collection_names():
                self.db.drop_collection(coll)


    def initialise_vertical(self, vertical_title, list_of_publications = None, list_of_authors = None, list_of_research_groups = None):
        result = self.db.verticals.insert_one({"name": vertical_title})
        vertical_id = result.inserted_id

        self.publications_to_database = []

        self.pub_citations = []

        if list_of_publications is not None:
            for publication_name in tqdm(list_of_publications):
                publication_summary = list(scholarly.search_pubs(publication_name))[0]

                time.sleep(self.parameters['wait_time'])

                publication_details = scholarly.fill(publication_summary)

                publication_details['vertical_id'] = vertical_id

                result = self.db.venues.insert_one({'venue_name': publication_details['bib']['venue']})
                
                publication_details['venue_id'] = result.inserted_id

                self.publications_to_database = self.publications_to_database + [publication_details]

                self.pub_citations = self.pub_citations + list(scholarly.citedby(publication_details))

        for pub_citation in tqdm(self.pub_citations):
            pub_citation_details = scholarly.fill(pub_citation)

            pub_citation_details['vertical_id'] = vertical_id

            result = self.db.venues.insert_one({'venue_name': pub_citation_details['bib']['venue']})
            
            pub_citation_details['venue_id'] = result.inserted_id

            self.publications_to_database = self.publications_to_database + [pub_citation_details]

            time.sleep(self.parameters['wait_time'])

        self.db.publications.insert_many(self.publications_to_database)

        for i in tqdm(range(self.parameters['iterations'])):
            x = 1