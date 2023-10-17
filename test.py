from bs4 import BeautifulSoup
from rnai_backend.rnai.utilities.networking import NetworkPortal
import asyncio

author_header = 'https://scholar.google.com/citations?hl=en&user=okreusUAAAAJ'

from playwright.sync_api import sync_playwright


def get_data_with_playwright(url):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False)
        page = browser.new_page()

        # go to url
        page.goto(url)

        html_rec = page.content()
        # get HTML
        return html_rec

def from_author_id(id, network_portal = None):

    data = {}

    url = author_header + id

    html_record = get_data_with_playwright(url)

    print(html_record)

    parsed_content = BeautifulSoup(html_record, 'html.parser')

    links = parsed_content.find_all('a')
    for link in links:
        print(link.get('href'))

    print(parsed_content)

    sgsgs

    print(html_record)

    parsed_content = BeautifulSoup(html_record, 'html.parser')

    print(parsed_content)

    print(parsed_content.find('div', id='gs_res_glb').get('data-sva'))

    return data

print('X')

#network_portal = NetworkPortal()

from_author_id(id = 'okreusUAAAAJ')

