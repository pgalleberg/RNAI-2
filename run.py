from rnai.main import RNAI

rnai = RNAI()

rnai.initialise_vertical()

for i in range(4):
    rnai.create_paper_buckets()
    rnai.complete_citations()

rnai.create_paper_buckets()

rnai.complete_authors()
rnai.get_author_details()

rnai.rank_vertical(vertical_id= "64ae965e73ed12785bcab2f6")
rnai.rank_authors()
