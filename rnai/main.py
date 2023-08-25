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
        # ask for confirmation before proceeding

        for coll in self.db.list_collection_names():
            self.db.drop_collection(coll)

    def populate_verticals(self):
        while self.current_level < self.parameters['depth'] + 1:

            print(self.current_level)
            print(self.parameters['depth'])

            while len(list(self.db.papers.find({"_bucket_exists": False}))) > 0:
                self.create_buckets()

            self.current_level = self.current_level + 1
            
    def create_buckets(self):
        pbar_cb = tqdm(total = self.db.papers.count_documents({"_bucket_exists": False}), leave = True)

        papers_to_bucket = list(self.db.papers.find({"_bucket_exists": False}))

        print(papers_to_bucket)

        for paper_to_bucket in papers_to_bucket:
            query = '+'.join(paper_to_bucket['title'].split())
            url = f"https://scholar.google.com/scholar?q={query}"

            html_record = self.network_portal.make_request(url)
            add_r = self.db.bucket_papers.insert_one({"_paper_id": paper_to_bucket['_id'], "_html": html_record})
            upd_r = self.db.papers.update_one({"_id": paper_to_bucket['_id']}, {"$set": {"_bucket_exists": True}})

            time.sleep(random.randint(100, 300)/100)
            
            pbar_cb.update(1)

        pbar_cb.close()
