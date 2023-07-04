from scholarly import scholarly
from scholarly import ProxyGenerator
from fp.fp import FreeProxy
import os, re, json, requests, random
from bs4 import BeautifulSoup
from bson import ObjectId

import time
from tqdm import tqdm
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
ca = certifi.where()

from rnai.authors import get_author_id_from_publication_result
from rnai.publications import get_citations

headers_set = [
    {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'},
    {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'},
    {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'},
    {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.171 Safari/537.36'},
    {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'},
    {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.171 Safari/537.36'},
    # Add more headers if needed
]


class RNAI:

    def __init__(self):
        self.parameters = {'iterations': 10, 'citations': 100, 'wait_time': 25}

        self.initialise_database()

    def initialise_database(self):
        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)

        self.db = self.mongo_client.rnai

        self.verticals = {}
        self.papers    = {}

        for vertical in self.db.verticals.find({}):
            self.verticals[str(vertical['_id'])] = vertical
            
        for paper in self.db.papers.find({}):
            self.papers[str(paper['_id'])] = paper

    def initialise_vertical(self, data_file_path = os.path.join('data', 'verticals.json')):

        # load json
        with open(data_file_path, 'r') as f:
            verticals_input_data = json.load(f)

        for vertical_name in verticals_input_data.keys():
            if vertical_name not in [self.verticals[vertical_id]['name'] for vertical_id in self.verticals.keys()]:
                result = self.db.verticals.insert_one({"name": vertical_name, "_complete": False})

                vertical_id = result.inserted_id

                for input_paper_name in verticals_input_data[vertical_name]['papers_list']:
                    if input_paper_name not in [self.papers[paper_id]['title'] for paper_id in self.papers.keys()]:
                        result = self.db.papers.insert_one({"title": input_paper_name, "_vertical_id": vertical_id, "_complete": False, "_bucket_exists": False, "_citations_complete": False, "_authors_listed": False, "_authors_complete": False, "_citations_listed": False, "_level_index":0})

    def complete_paper_first_level(self):

        for paper_key in self.papers.keys():
            result = self.db.papers.find_one({"_id": ObjectId(paper_key)})

            self.process_publication(result)

    def process_publication(self, paper_record):

        if paper_record['_bucket_exists'] is True:
            html_record = self.db.bucket_papers.find_one({"_paper_id": paper_record['_id']})['_html']
            
        else:
            query = '+'.join(paper_record['title'].split())
            url = f"https://scholar.google.com/scholar?q={query}"

            response = requests.get(url,headers = random.choice(headers_set))
            response.raise_for_status()

            html_record = response.text

            add_r = self.db.bucket_papers.insert_one({"_paper_id": paper_record['_id'], "_html": html_record})
            upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_bucket_exists": True}})

        parsed_content = BeautifulSoup(html_record, 'html.parser')

        main_result = (parsed_content.find('div', {'class': 'gs_ri'}))
        
        result = parsed_content.find('div', {'class': 'gs_ri'})

        if paper_record['_authors_listed'] is False:
            author_ids = get_author_id_from_publication_result(result)

            a_inserted_ids = []

            if len(author_ids) > 0:
                for author_id in author_ids:
                    auth_result = self.db.authors.insert_one({"_ags_id": author_id, "_complete": False})

                    a_inserted_ids = a_inserted_ids + [auth_result.inserted_id]

                upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_authors_listed": True, "_authors": a_inserted_ids}})

        # wait random time between 5 and 10 seconds
        time.sleep(random.randint(500, 1000)/100)

        if paper_record['_citations_listed'] is False:

            link_element = main_result.find('a', {'data-clk': True})
            if link_element:
                paper_id = link_element['data-clk'].split('&d=')[1].split('&')[0]

                citations = get_citations(paper_id)

                for citation in citations:
                    result = self.db.papers.insert_one({"title": citation, "_vertical_id": paper_record['_vertical_id'], "_complete": False, "_bucket_exists": False, "_citations_complete": False, "_authors_listed": False, "_authors_complete": False, "_citations_listed": False, "_level_index":0})

                    print(result)



