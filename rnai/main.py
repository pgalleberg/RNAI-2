from scholarly import scholarly
import os, re, time, json, requests, random
from bs4 import BeautifulSoup
from bson import ObjectId
from selenium import webdriver
from langdetect import detect
from tqdm import tqdm
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
import logging

ca = certifi.where()

from rnai.utilities.networking import NetworkPortal
from rnai.verticals.add import add_vertical
from rnai.papers.add import add_paper
from rnai.papers.citations import get_citations

class RNAI:
    def __init__(self, reset = False, collection = 'rnai', initial_data = os.path.join('data', 'initial_vertical_data.json')):
        self.parameters = {'iterations': 10, 'citations': 100, 'wait_time': 25, 'depth': 4}

        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)
        self.db = self.mongo_client[collection]

        self.papers, self.authors, self.current_level = {}, {}, 0

        self.network_portal = NetworkPortal()

        with open(initial_data, 'r') as f:
            self.initial_data = json.load(f)

        if reset is True:
            self.reset()

        pbar_v = tqdm(total = len(self.initial_data.keys()), leave = True)
        for vertical_name in self.initial_data.keys():
            vertical_id = add_vertical(self.db, vertical_name)
            
            pbar_ip = tqdm(total = len(self.initial_data[vertical_name]['papers_list']), leave = True)
            
            for input_paper_name in self.initial_data[vertical_name]['papers_list']:
                paper_id = add_paper(self.db, vertical_id, input_paper_name, 0)
                self.papers[input_paper_name] = paper_id
                pbar_ip.update(1)

            pbar_ip.close()
            pbar_v.update(1)
        
        pbar_v.close()
    
    def reset(self):
        for coll in self.db.list_collection_names():
            self.db.drop_collection(coll)

    def populate_verticals(self):
        while self.current_level < self.parameters['depth'] + 1:
            print('Populating Verticals - Level ' + str(self.current_level) + ' - Generate Buckets')
            while len(list(self.db.papers.find({"_bucket_exists": False}))) > 0:
                self.create_buckets()

            print('Populating Verticals - Level ' + str(self.current_level) + ' - Process Papers')

            self.process_papers()

            self.current_level = self.current_level + 1
            
    def create_buckets(self):
        pbar_cb = tqdm(total = self.db.papers.count_documents({"_bucket_exists": False}), leave = True)

        papers_to_bucket = list(self.db.papers.find({"_bucket_exists": False}))

        for paper_to_bucket in papers_to_bucket:
            query = '+'.join(paper_to_bucket['title'].split())
            url = f"https://scholar.google.com/scholar?q={query}"

            html_record = self.network_portal.make_request(url)
            add_r = self.db.bucket_papers.insert_one({"_paper_id": paper_to_bucket['_id'], "_html": html_record})
            upd_r = self.db.papers.update_one({"_id": paper_to_bucket['_id']}, {"$set": {"_bucket_exists": True}})

            time.sleep(random.randint(100, 300)/100)
            
            pbar_cb.update(1)

        pbar_cb.close()

    def process_papers(self):
        
        pbar_cp = tqdm(total = self.db.papers.count_documents({"$and": [{"_cite_by_complete": False}, {"_bucket_exists": True}]}), leave = True)
        
        papers_to_complete = list(self.db.papers.find({"$and": [{"_cite_by_complete": False}, {"_bucket_exists": True}]}))

        for paper_to_complete in papers_to_complete:
            html_record = self.db.bucket_papers.find_one({"_paper_id": paper_to_complete['_id']})['_html']
            parsed_content = BeautifulSoup(html_record, 'html.parser')
            
            main_result = parsed_content.find('div', {'class': 'gs_ri'})
            
            cited_by_details = parsed_content.select_one('a:-soup-contains("Cited by")').text if parsed_content.select_one('a:-soup-contains("Cited by")') is not None else 'No citation count'
            
            processsed_cited_by = [int(s) for s in cited_by_details.split() if s.isdigit()]

            if len(processsed_cited_by) > 0:
                citation_count = processsed_cited_by[-1]
            else:
                citation_count = None

            if '_citation_count' not in paper_to_complete.keys():
                upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_citation_count": citation_count}})
                
            elif paper_to_complete['_citation_count'] is None:
                upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_citation_count": citation_count}})

            if paper_to_complete['_cite_by_complete'] is False:

                if main_result is not None:
                    link_element = main_result.find('a', {'data-clk': True})

                else:
                    link_element = None

                if link_element:
                    paper_id = link_element['data-clk'].split('&d=')[1].split('&')[0]

                    citations = get_citations(paper_id, self.network_portal)

                    for citation in citations:
                        paper_id = add_paper(self.db, paper_to_complete['_vertical_id'], citation, self.current_level + 1)
                        self.papers[citation] = paper_id

                    if len(citations) > 0:
                        upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_cite_by_complete": True}})
                        
                    else:
                        upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_cite_by_complete": 'ERROR'}})

            pbar_cp.update(1)

        pbar_cp.close()

    def rank_verticals(self):
        verticals = self.db.verticals.find({})

        for vertical in verticals:
            

