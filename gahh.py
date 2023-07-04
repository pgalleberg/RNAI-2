import requests
from bs4 import BeautifulSoup

def get_citations(paper_id):

    start = 0

    citations = []

    while True:
        url = f"https://scholar.google.com/scholar?start={start}&cites={paper_id}&hl=en"
        
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        citation_elements = soup.find_all('a', {'data-clk': True})

        print(citation_elements)
        if not citation_elements:
            break

        for citation in citation_elements:
            citation_name = citation.get_text(strip=True)

            if not citation_name[0] == '[':
                citations = citations + [citation_name]

        start += 10

    return citations

print(get_citations('12890608974762536247'))