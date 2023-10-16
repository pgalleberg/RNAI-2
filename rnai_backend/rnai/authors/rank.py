from tqdm import tqdm

def rank_authors(db):
    authors_to_rank = list(db.authors.find({'_complete': True}))
    pbar_ra = tqdm(total = db.authors.count_documents({'_complete': True}), leave = True)
    
    for author_rank in authors_to_rank:
        citation_count = int(author_rank['citedby'])
        paper_occurrences = db.papers.count_documents({'_authors': author_rank['_id']})
        
        authored_papers = db.papers.find({'_authors': author_rank['_id']})
        
        citations_in_vertical = 0
        
        for apaper in authored_papers:
            occurrences = db.papers.count_documents({'_vertical_id': apaper['_vertical_id'], '_cited_by': apaper['_id']})
            citations_in_vertical = citations_in_vertical + occurrences

        score = (citation_count/10000) + (citations_in_vertical/5) + (paper_occurrences/50)
            
        db.authors.update_one({'_id': author_rank['_id']}, {'$set': {'_score': score}})
        pbar_ra.update(1)