import re

def get_author_id_from_publication_result(input):
    author_tags = input.find_all("div", {"class": "gs_a"})
    pattern = r'\?user=(.*?)&amp'
    
    author_ids = re.findall(pattern, str(author_tags[0]))
    
    return author_ids