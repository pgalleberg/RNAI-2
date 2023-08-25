

def add_vertical(db, vertical_name):
    vertical_exists = db.verticals.find_one({"name": vertical_name})

    if vertical_exists is None:
        result = db.verticals.insert_one({"name": vertical_name, "_complete": False})

        vertical_id = result.inserted_id

        log_string = f'Vertical {vertical_name} added.'

    else:
        vertical_id = vertical_exists['_id']

        log_string = f'Vertical {vertical_name} already exists.'

    return vertical_id, log_string
