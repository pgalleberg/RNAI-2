import datetime
from langdetect import detect

def add_paper(db, vertical_id, paper_name, level):
    log_string = ''

    paper_exists = db.papers.find_one({'_vertical_id': vertical_id, 'title': paper_name})

    if paper_exists is None:
        if detect(paper_name) == 'en':
            result = db.papers.insert_one({'title': paper_name, '_vertical_id': vertical_id, '_complete': False, '_reviewed': False,  '_bucket_exists': False, '_cites_complete': False, '_cite_by_complete': False, '_authors_listed': False, '_authors_complete': False, '_citations_listed': False, '_level': level, '_citation_count': None, '_cites': [], '_cited_by': []})

            paper_id = result.inserted_id

            log_string += f'Paper {paper_name} added to vertical {vertical_id}.'

        else:
            paper_id = None
            log_string += f'Paper {paper_name} is not in English. Skipping.'

    else:
        paper_id = paper_exists['_id']
        log_string += f'Paper {paper_name} already exists in vertical {vertical_id}.'

    return paper_id, log_string
