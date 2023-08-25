from tqdm import tqdm

def rank_papers_in_vertical(db, vertical_id):
    publications_to_rank = list(db.papers.find({'_vertical_id': vertical_id}))
    pbar_rv = tqdm(total = db.papers.count_documents({"_vertical_id": vertical_id}), leave = True)

    for pub_ranked in publications_to_rank:
        if '_citation_count' not in pub_ranked.keys():
            pub_ranked['_citation_count'] = None

        level_index = pub_ranked['_level_index']
        citation_count = pub_ranked['_citation_count']
        occurrences = db.papers.count_documents({'_vertical_id': vertical_id, '_cited_by': pub_ranked['_id']})
        
        if citation_count is None:
            citation_count = 0
            ranking = ((5 - level_index) / 5) + (citation_count / 100) + (occurrences / 25)
            
            db.papers.update_one({'_id': pub_ranked['_id']}, {'$set': {'_score': ranking}})
            pbar_rv.update(1)

    pbar_rv.close()