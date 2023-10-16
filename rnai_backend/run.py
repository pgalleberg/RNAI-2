from rnai.main import RNAI

rnai = RNAI(reset = False)
#rnai.populate_verticals()

rnai.process_papers(level = 3, cited_by_flag = False)
rnai.rank_verticals()
rnai.process_authors()
rnai.populate_author_records()
rnai.network_portal.shutdown()


'''
rnai.initialise_vertical()

for i in range(4):
    rnai.create_paper_buckets()
    rnai.complete_citations()

rnai.create_paper_buckets()

rnai.complete_authors()
rnai.get_author_details()

rnai.rank_vertical(vertical_id= "64ae965e73ed12785bcab2f6")
rnai.rank_authors()
'''