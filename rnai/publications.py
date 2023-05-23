from scholarly import scholarly

def get_publication_details(publication_name):
    search_results = scholarly.search_pubs(publication_name)

    publication_list = list(search_results)

    return publication_list[0]