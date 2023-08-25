import requests
from urllib.parse import urlparse
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS

proxy_rotation_mode = 'AWS'

aws_access_key_id = 'AKIA55ZYZKB4747LBJ3H'
aws_secret_access_key = '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'

src = 'https://scholar.google.com'
src_parsed = urlparse(src)
src_nopath = "%s://%s" % (src_parsed.scheme, src_parsed.netloc)


class NetworkPortal:
    def __init__(self):
        self.gateway = ApiGateway(src_nopath, regions=EXTRA_REGIONS, access_key_id=f"{aws_access_key_id}", access_key_secret=f"{aws_secret_access_key}")
        self.gateway.start(force=True)
        self.session = requests.Session()
        self.session.mount(src_nopath, self.gateway)
        #self.x = 0

    def make_request(self, url):
        response = self.session.get(url)
        response.raise_for_status()
        html_record = response.text

        '''

        with ApiGateway(src_nopath, access_key_id=f"{aws_access_key_id}", access_key_secret=f"{aws_secret_access_key}") as g:
            session = requests.Session()
            session.mount('https://scholar.google.com', g)

            response = session.get(url)
            response.raise_for_status()
            html_record = response.text
        '''

        return html_record
    
    def shutdown(self):
        self.gateway.shutdown()


'''
import requests
from requests_ip_rotator import ApiGateway

with ApiGateway("https://site.com") as g:
    session = requests.Session()
    session.mount("https://site.com", g)

    response = session.get("https://site.com/index.php")
    print(response.status_code)
'''