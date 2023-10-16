import re

def get_author_id_from_publication_result(input_arg):

    if input_arg is not None:
        author_tags = input_arg.find_all("div", {"class": "gs_a"})
        pattern = r'\?user=(.*?)&amp'
        author_ids = re.findall(pattern, str(author_tags[0]))
        
        return author_ids
    
    else:
        return []