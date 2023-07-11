



# this method checks if the vertical name exists in mongodb db.rnai.verticals
def vertical_exists_in_db(self, vertical_name):
    return self.db.verticals.find_one({"name": vertical_name})

