from scholarly import scholarly

def get_author_from_id(author_id):
    author = scholarly.search_author_id(author_id)

    return author