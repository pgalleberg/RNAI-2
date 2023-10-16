

def paper_exists_in_db(self, vertical_id, paper_name):
    return self.db.papers.find_one({"_vertical_id": vertical_id, "title": paper_name})