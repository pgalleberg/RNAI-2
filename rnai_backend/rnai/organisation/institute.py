import datetime
def add_institute(db, institute_name):

    inst_exists = db.institutes.find_one({'name': institute_name})

    if inst_exists is None:
        result = db.institutes.insert_one({'name': institute_name})

        inst_id = result.inserted_id

        log_string = f'Institute {institute_name} added.'

    else:
        inst_id = inst_exists['_id']
        log_string = f'Institute {institute_name} already exists.'

    return inst_id, log_string