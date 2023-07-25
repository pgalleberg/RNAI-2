import time, requests
from urllib.parse import urlparse
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS
aws_access_key_id = 'AKIA55ZYZKB4UFLS7K26'

proxy_rotation_mode = 'AWS'


aws_secret_access_key = 'zkH51MIFsl+fa/PQXDgs1uxAArOA9dO6aedoQRT3'
src = 'https://api64.ipify.org'
src_parsed = urlparse(src)
src_nopath = "%s://%s" % (src_parsed.scheme, src_parsed.netloc)
gateway1 = ApiGateway(src_nopath, regions=EXTRA_REGIONS, access_key_id=f"{aws_access_key_id}", access_key_secret=f"{aws_secret_access_key}")
gateway1.start(force=True)
session1 = requests.Session()
session1.mount(src_nopath, gateway1)

for i in range(10):
    time.sleep(1)

    start = time.time()
    r = session1.get('https://api64.ipify.org', stream=True)

    print(r.text)
    file_request_succeed = r.ok
    if file_request_succeed:
        print('Rotated IP succeed')
        end = time.time()
        print(end - start)
    else:
        print('Rotated IP failed')



gateway1.shutdown()