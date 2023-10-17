from bs4 import BeautifulSoup

import re, requests, spacy, nltk, random
from nltk import word_tokenize, pos_tag

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
# Load the pre-trained NER model
nlp = spacy.load("en_core_web_sm")
delimiters = [',', '-', '|', ';', ':']

def restrieve_author_details(nlp_module, author_id):

    author_data = {}

    author_data['scholar_id'] = None

    url = 'https://scholar.google.com/citations?hl=en&user=' + author_id

    proxies = ["190.64.18.177:80", "212.145.210.146:80", "115.132.32.91:8080", "202.86.138.18:8080", "192.99.160.45:8080", "50.173.140.150:80"]

    proxy_address = 'http://' + random.choice(proxies)
    
    proxies = {'http': proxy_address}
    
    html_record = requests.get(url, proxies=proxies, headers={'User-Agent': 'Mozilla/5.0'}).text

    parsed_content = BeautifulSoup(html_record, 'html.parser')

    author_data['scholar_id'] = re.findall(author_id, parsed_content.find("link", rel="canonical").get('href', ""))[0]
    author_data['name'] = parsed_content.find('div', id='gsc_prf_in').text

    affiliation = parsed_content.find('div', class_='gsc_prf_il')

    text = affiliation.get_text()

    author_data['affiliation_raw'] = text

    org_name = None
    role = None

    for delimiter in delimiters:
        parts = text.split(delimiter)

        for part in parts:
            part = part.strip()

            tokens = word_tokenize(part)
            pos_tags = pos_tag(tokens)

            num_tokens = len(tokens)

            doc = nlp(part)
            org_names = [ent.text for ent in doc.ents if ent.label_ == "ORG"]

            org_name = ' '.join(org_names)

            if num_tokens >= 2:
                if org_name:
                    org_name = part
                else:
                    for token, pos in pos_tags:
                        if pos == 'NN' or pos == 'NNP':
                            role = part

            if org_name and role:
                break

        if org_name and role:
            break

    author_data['org_name'] = org_name
    author_data['role'] = role

    author_data['citation_count'] = int(parsed_content.find_all('td', class_='gsc_rsb_std')[0].text)

    if author_data['scholar_id'] is None:
        iskjhgiskjghei
    

    return author_data
