from scholarly import scholarly
import time, random

def get_publication_details(publication_name):
    search_results = scholarly.search_pubs(publication_name)

    publication_list = list(search_results)

    return publication_list[0]


import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from nordvpn_switcher import initialize_VPN,rotate_VPN,terminate_VPN

def get_citations(paper_id):

    start = 0

    citations = []

    browser = webdriver.Chrome()

    while True:
        url = f"https://scholar.google.com/scholar?start={start}&cites={paper_id}&hl=en"
        
        #response = requests.get(url)
        browser.get(url)
        html_record = browser.page_source
        soup = BeautifulSoup(html_record, 'html.parser')
        
        citation_elements = soup.find_all('a', {'data-clk': True})
        if not citation_elements:
            break

        for citation in citation_elements:
            citation_name = citation.get_text(strip=True)

            if not citation_name[0] == '[':
                citations = citations + [citation_name]

        start += 10

        if start > 20:
            break

        time.sleep(random.randint(500, 1000)/100)
    return citations
