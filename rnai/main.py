from scholarly import scholarly
from scholarly import ProxyGenerator
from fp.fp import FreeProxy
import os, re, json, requests, random
from bs4 import BeautifulSoup
from bson import ObjectId
from selenium import webdriver
from langdetect import detect
import time
from tqdm import tqdm
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from nordvpn_switcher import initialize_VPN,rotate_VPN,terminate_VPN

ca = certifi.where()

from rnai.authors import get_author_id_from_publication_result
from rnai.publications import get_citations

from rnai.papers import paper_exists_in_db

from rnai.verticals import vertical_exists_in_db
from rnai.utilities.vpn import logIn

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
        logIn()
        self.parameters = {'iterations': 10, 'citations': 100, 'wait_time': 25}

        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)
        self.db = self.mongo_client.rnai

        #self.browser = webdriver.Chrome()

        #self.settings = initialize_VPN(save=1,area_input=['complete rotation'])

        self.papers, self.authors = {}, {}

        self.request_counter = 0

        self.maximum_depth = 4


    def initialise_vertical(self, data_file_path = os.path.join('data', 'verticals.json')):

        # load json
        with open(data_file_path, 'r') as f:
            verticals_input_data = json.load(f)

        pbar_v = tqdm(total = len(verticals_input_data.keys()), leave = True)

        for vertical_name in verticals_input_data.keys():

            vertical_exists = vertical_exists_in_db(self, vertical_name)

            if vertical_exists:
                vertical_id = vertical_exists['_id']

            else:
                vertical_insert = self.db.verticals.insert_one({"name": vertical_name, "_complete": False})
                
                vertical_id = vertical_insert.inserted_id

            pbar_ip = tqdm(total = len(verticals_input_data[vertical_name]['papers_list']), leave = True)

            for input_paper_name in verticals_input_data[vertical_name]['papers_list']:

                if paper_exists_in_db(self, vertical_id, input_paper_name) is None:
                    if detect(input_paper_name) == 'en':
                        result = self.db.papers.insert_one({"title": input_paper_name, "_vertical_id": vertical_id, "_complete": False, "_bucket_exists": False, "_citations_complete": False, "_authors_listed": False, "_authors_complete": False, "_citations_listed": False, "_level_index":0, '_citation_count': None, '_cited_by': []})

                        self.papers[input_paper_name] = result.inserted_id

                pbar_ip.update(1)

            pbar_v.update(1)

    def create_paper_buckets(self):

        pbar_cb = tqdm(total = self.db.papers.count_documents({"_bucket_exists": False}), leave = True)

        self.papers_to_bucket = list(self.db.papers.find({"_bucket_exists": False}))

        #rotate_VPN(self.settings) 

        while len(self.papers_to_bucket) > 0:

            if self.request_counter > 14:
                logIn()
                self.request_counter = 0            
            self.create_bucket(random.sample(list(self.papers_to_bucket), 1)[0])
            
            pbar_cb.update(1)
            self.papers_to_bucket = list(self.db.papers.find({"_bucket_exists": False}))

    def create_bucket(self, paper_record):
        
        query = '+'.join(paper_record['title'].split())
        url = f"https://scholar.google.com/scholar?q={query}"
        
        response = requests.get(url,headers = random.choice(headers_set))
        response.raise_for_status()
        html_record = response.text

        #self.browser.get(url)
        #html_record = self.browser.page_source
        
        add_r = self.db.bucket_papers.insert_one({"_paper_id": paper_record['_id'], "_html": html_record})
        upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_bucket_exists": True}})

        self.request_counter = self.request_counter + 1

        time.sleep(random.randint(100, 300)/100)

    def complete_citations(self):

        pbar_cp = tqdm(total = self.db.papers.count_documents({"$and": [{"_citations_listed": False}, {"_bucket_exists": True}]}), leave = True)
        self.papers_to_complete = list(self.db.papers.find({"$and": [{"_citations_listed": False}, {"_bucket_exists": True}]}))

        #rotate_VPN(self.settings) 

        while len(self.papers_to_complete) > 0:

            paper_rec = random.sample(list(self.papers_to_complete), 1)[0]

            if paper_rec['_level_index'] < self.maximum_depth:
                self.process_citations(paper_rec)


            pbar_cp.update(1)
            self.papers_to_complete = list(self.db.papers.find({"$and": [{"_citations_listed": False}, {"_bucket_exists": True}]}))

    def process_citations(self, paper_record):
        html_record = self.db.bucket_papers.find_one({"_paper_id": paper_record['_id']})['_html']

        parsed_content = BeautifulSoup(html_record, 'html.parser')

        main_result = parsed_content.find('div', {'class': 'gs_ri'})

        cited_by_details = parsed_content.select_one('a:-soup-contains("Cited by")').text if parsed_content.select_one('a:-soup-contains("Cited by")') is not None else 'No citation count'
        
        processsed_cited_by = [int(s) for s in cited_by_details.split() if s.isdigit()]

        if self.request_counter > 14:
                logIn()
                self.request_counter = 0

        if len(processsed_cited_by) > 0:
            citation_count = processsed_cited_by[-1]
        else:
            citation_count = None

        if '_citation_count' not in paper_record.keys():
            upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_citation_count": citation_count}})

        elif paper_record['_citation_count'] is None:
            upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_citation_count": citation_count}})

        if paper_record['_citations_listed'] is False:

            self.request_counter = self.request_counter + 1

            if main_result is not None:
                link_element = main_result.find('a', {'data-clk': True})

            else:
                link_element = None
            if link_element:
                paper_id = link_element['data-clk'].split('&d=')[1].split('&')[0]

                citations = get_citations(paper_id)

                print(citations)

                for citation in citations:
                    if detect(citation) == 'en':

                        if citation not in self.papers.keys():
                            result = self.db.papers.insert_one({"title": citation, "_vertical_id": paper_record['_vertical_id'], "_complete": False, "_bucket_exists": False, "_citations_complete": False, "_authors_listed": False, "_authors_complete": False, "_citations_listed": False, "_level_index": paper_record['_level_index'] + 1, '_cited_by': [paper_record['_id']]})
                            
                            self.papers[citation] = result.inserted_id

                        else:
                            upd_r = self.db.papers.update_one({"_id": self.papers[citation]}, {"$push": {"_cited_by": paper_record['_id']}})


                if len(citations) > 0:
                    upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_citations_listed": True}})

                else:
                    upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_citations_listed": 'ERROR'}})

    def rank_vertical(self, vertical_id):

        vertical_id = ObjectId(vertical_id)

        publications_to_rank = list(self.db.papers.find({'_vertical_id': vertical_id}))

        pbar_rv = tqdm(total = self.db.papers.count_documents({"_vertical_id": vertical_id}), leave = True)

        for pub_ranked in publications_to_rank:
            if '_citation_count' not in pub_ranked.keys():
                pub_ranked['_citation_count'] = None

            level_index = pub_ranked['_level_index']
            citation_count = pub_ranked['_citation_count']
            occurrences = self.db.papers.count_documents({'_vertical_id': vertical_id, '_cited_by': pub_ranked['_id']})

            if citation_count is None:
                citation_count = 0

            
            ranking = ((5 - level_index) / 5) + (citation_count / 100) + (occurrences / 25)
            
            self.db.papers.update_one({'_id': pub_ranked['_id']}, {'$set': {'_ranking': ranking}})
            pbar_rv.update(1)

    def complete_authors(self):
        pbar_ca = tqdm(total = self.db.papers.count_documents({"$and": [{"_authors_listed": False}, {"_bucket_exists": True}]}), leave = True)

        papers_to_complete = list(self.db.papers.find({"$and": [{"_authors_listed": False}, {"_bucket_exists": True}]}))

        for paper_record in papers_to_complete:
            self.process_authors(paper_record)

            pbar_ca.update(1)

    def process_authors(self, paper_record):
        html_record = self.db.bucket_papers.find_one({"_paper_id": paper_record['_id']})['_html']

        parsed_content = BeautifulSoup(html_record, 'html.parser')

        main_result = parsed_content.find('div', {'class': 'gs_ri'})

        if paper_record['_authors_listed'] is False:
            author_ids = get_author_id_from_publication_result(main_result)

            a_inserted_ids = []

            if len(author_ids) > 0:
                for author_id in author_ids:
                    auth_result = self.db.authors.insert_one({"_ags_id": author_id, "_complete": False})

                    a_inserted_ids = a_inserted_ids + [auth_result.inserted_id]

                upd_r = self.db.papers.update_one({"_id": paper_record['_id']}, {"$set": {"_authors_listed": True, "_authors": a_inserted_ids}})

    def get_author_details(self):

        pbar_ca = tqdm(total = self.db.authors.count_documents({"_complete": False}), leave = True)

        for author_record in self.db.authors.find({"_complete": False}):
            
            if self.request_counter > 22:
                logIn()
                self.request_counter = 0

            author = scholarly.search_author_id(author_record['_ags_id'])

            for akey in author.keys():

                if type(author[akey]) is int:
                    author[akey] = str(author[akey])
                author_record[akey] = author[akey]
                
            author_record['_complete'] = True

            self.db.authors.update_one({"_id": author_record['_id']}, {"$set": author_record})

            pbar_ca.update(1)
    
    def rank_authors(self):
        
        authors_to_rank = list(self.db.authors.find({'_complete': True}))

        pbar_ra = tqdm(total = self.db.authors.count_documents({'_complete': True}), leave = True)

        for author_rank in authors_to_rank:
            citation_count = int(author_rank['citedby'])
            paper_occurrences = self.db.papers.count_documents({'_authors': author_rank['_id']})

            authored_papers = self.db.papers.find({'_authors': author_rank['_id']})

            citations_in_vertical = 0

            for apaper in authored_papers:

                occurrences = self.db.papers.count_documents({'_vertical_id': apaper['_vertical_id'], '_cited_by': apaper['_id']})

                citations_in_vertical = citations_in_vertical + occurrences

            ranking = (citation_count/10000) + (occurrences/5) + (paper_occurrences/50)
            
            self.db.authors.update_one({'_id': author_rank['_id']}, {'$set': {'_ranking': ranking}})
            pbar_ra.update(1)