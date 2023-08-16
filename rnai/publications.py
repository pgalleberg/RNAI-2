from scholarly import scholarly
import time, random

def get_publication_details(publication_name):
    search_results = scholarly.search_pubs(publication_name)

    publication_list = list(search_results)

    return publication_list[0]


import requests
from bs4 import BeautifulSoup
from selenium import webdriver

def get_citations(paper_id, session):

    start = 0

    citations = []

    #browser = webdriver.Chrome()

    while True:
        url = f"https://scholar.google.com/scholar?start={start}&cites={paper_id}&hl=en"
        
        response = session.get(url)
        html_record = response.text

        #browser.get(url)
        #html_record = browser.page_source

        #print(html_record)
        
        soup = BeautifulSoup(html_record, 'html.parser')
        
        citation_elements = soup.find_all('a', {'data-clk': True})
        if not citation_elements:
            break

        for citation in citation_elements:
            citation_name = citation.get_text(strip=True)

            if not citation_name[0] == '[':
                citations = citations + [citation_name]

        start += 10

        time.sleep(random.randint(2, 5)/100)
    return citations
