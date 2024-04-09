from grants_gov import get_grants_grants_gov
from grantforward import get_grants_grantforward
from utils import delete_files, fetch_grants

get_grants_grantforward()
get_grants_grants_gov()
delete_files()
# fetch_grants('methane removal from ambient air', "grants.gov")
# fetch_grants('methane removal from ambient air', "GrantForward")