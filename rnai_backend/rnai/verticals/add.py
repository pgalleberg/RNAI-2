# get date and time
from datetime import datetime

def add_vertical(db, vertical_name, start_time, admin_id):
    vertical_exists = db.verticals.find_one({"name": vertical_name})

    if vertical_exists is None:
        result = db.verticals.insert_one({"name": vertical_name, "admin_id": None,  "_complete": False, "status": "Pending", "_api_start_time": datetime.now(), "task_start_at": start_time, "admin_id": admin_id})

        vertical_id = result.inserted_id

        log_string = f'Vertical {vertical_name} added.'

    else:
        vertical_id = vertical_exists['_id']

        log_string = f'Vertical {vertical_name} already exists.'

    return vertical_id, log_string
