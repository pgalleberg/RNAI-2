from scholarly import scholarly
import os, re, time, json, requests, random, sys
from bs4 import BeautifulSoup
from bson import ObjectId
from selenium import webdriver
from langdetect import detect
from tqdm import tqdm
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
import logging
import spacy

ca = certifi.where()

from rnai.utilities.networking import NetworkPortal
from rnai.verticals.add import add_vertical
from rnai.verticals.rank_papers import rank_papers_in_vertical
from rnai.papers.add import add_paper
from rnai.papers.citations import get_citations
from rnai.authors.retrieve import restrieve_author_details
from rnai.authors.author_ids import get_author_id_from_publication_result
from rnai.authors.rank import rank_authors
from rnai.organisation.institute import add_institute

class RNAI:
    def __init__(self, reset = False, collection = 'rnai'):
        self.parameters = {'iterations': 10, 'citations': 10, 'wait_time': 25, 'depth': 4}

        print('Initialising RNAI Runtime')

        self.mongo_client = MongoClient('mongodb+srv://vih:lwJGhZ37uM07vhrO@tsp.geu7l4s.mongodb.net/?retryWrites=true&w=majority', tlsCAFile = ca)
        self.db = self.mongo_client[collection]

        self.retrieve_cite_parameters()

        self.papers, self.authors, self.current_level = {}, {}, 0

        self.network_portal = NetworkPortal()

        self.nlp_module = spacy.load("en_core_web_sm")

        if reset is True:
            self.reset()

    def initialise_vertical(self, vertical_name, papers_list, start_time, admin_id):
        vertical_id, log_string = add_vertical(self.db, vertical_name, start_time, admin_id)
                
        for input_paper_name in papers_list:
            paper_id, log_string = add_paper(self.db, vertical_id, input_paper_name, 0)
            self.papers[input_paper_name] = paper_id

    def retrieve_cite_parameters(self, configuration_name = 'default'):

        if configuration_name in ['default']:
            self.configuration_params = self.mongo_client.rnai_deployment.cite_parameters.find_one({'name': configuration_name})
        else:
            sys.exit('CONFIGRURATION CITE ERROR')
 
    def reset(self):
        print('Resetting Database')
        for coll in self.db.list_collection_names():
            self.db.drop_collection(coll)

    def populate_verticals(self):
        while self.current_level < self.parameters['depth'] + 1:
            print('Populating Verticals - Level ' + str(self.current_level) + ' - Generate Buckets')
            while len(list(self.db.papers.find({"_bucket_exists": False}))) > 0:
                self.create_buckets()

            print('Populating Verticals - Level ' + str(self.current_level) + ' - Process Papers')

            self.process_papers(level = self.current_level)

            self.current_level = self.current_level + 1
            
    def create_buckets(self):
        papers_to_bucket = list(self.db.papers.find({"_bucket_exists": False}))

        for paper_to_bucket in papers_to_bucket:
            query = '+'.join(paper_to_bucket['title'].split())
            url = f"https://scholar.google.com/scholar?q={query}"

            html_record = self.network_portal.make_request(url)
            add_r = self.db.bucket_papers.insert_one({"_paper_id": paper_to_bucket['_id'], "_html": html_record})
            upd_r = self.db.papers.update_one({"_id": paper_to_bucket['_id']}, {"$set": {"_bucket_exists": True}})

            time.sleep(random.randint(50, 229)/100)

    def process_papers(self, level, cited_by_flag = True):
                
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

            if (paper_to_complete['_cite_by_complete'] is False) and (cited_by_flag is True):

                if main_result is not None:
                    link_element = main_result.find('a', {'data-clk': True})

                else:
                    link_element = None

                if link_element:
                    paper_id = link_element['data-clk'].split('&d=')[1].split('&')[0]

                    _cites_level = self.configuration_params['cites'][level]

                    citations = get_citations(paper_id, self.network_portal, _cites_level)

                    for citation in citations:
                        paper_id = add_paper(self.db, paper_to_complete['_vertical_id'], citation, self.current_level + 1)
                        self.papers[citation] = paper_id

                    if len(citations) > 0:
                        upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_cite_by_complete": True, '_complete':True}})
                        
                    else:
                        upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_cite_by_complete": 'ERROR'}})

            elif cited_by_flag is False:
                upd_r = self.db.papers.update_one({"_id": paper_to_complete['_id']}, {"$set": {"_cite_by_complete": True, '_complete':True}})

    def rank_verticals(self):
        verticals = self.db.verticals.find({})

        for vertical in verticals:
            rank_papers_in_vertical(self.db, vertical['_id'])
    
    def process_authors(self):
        papers_to_complete = list(self.db.papers.find({"$and": [{"_authors_listed": False}, {"_bucket_exists": True}]}))

        pbar_pa = tqdm(total = len(papers_to_complete), leave = True)

        for paper_record in papers_to_complete:
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

            pbar_pa.update(1)

    def populate_author_records(self):

        pbar_par = tqdm(total = len(list(self.db.authors.find({"_complete": False}))), leave = True)
        for author_record in self.db.authors.find({"_complete": False}):

            author_data = restrieve_author_details(nlp_module = self.nlp_module, author_id = author_record['_ags_id'])

            author_data['institute_name'] = author_data['org_name']

            if author_data['org_name'] is not None:
                inst_id = add_institute(self.db, author_data['org_name'])
                author_data['institute_id'] = inst_id

            for akey in author_data.keys():
                author_record[akey] = author_data[akey]
                
            author_record['_complete'] = True

            self.db.authors.update_one({"_id": author_record['_id']}, {"$set": author_record})
            pbar_par.update(1)

        rank_authors(self.db)

