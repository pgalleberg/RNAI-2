from flask import Flask, request, jsonify
from rnai.main import RNAI
from multiprocessing import Process
from bson.json_util import dumps
from bson import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

rnai = RNAI(reset = False)

vertical_processes = {}

def vertical_creation_process(vertical_name, papers_list, start_time, admin_id):
    rnai.initialise_vertical(vertical_name, papers_list, start_time, admin_id)
    rnai.populate_verticals()

    rnai.rank_verticals()
    rnai.process_authors()
    rnai.populate_author_records()

@app.route('/tasks/initialise', methods=['POST'])
def initialise():

    request_parameters = request.json

    print(request_parameters)

    vertical_processes[request_parameters['query']] = Process(target = vertical_creation_process, kwargs = dict(vertical_name=request_parameters['query'], papers_list = request_parameters['papers'], start_time = request_parameters['time'], admin_id = request_parameters['admin_id']))

    vertical_processes[request_parameters['query']].start()   

    return jsonify({"status": "success"})

@app.route('/tasks/webmaster', methods=['GET'])
def webmaster():

    vertical_data = rnai.db.verticals.find({})

    result_v = []

    for vertical in vertical_data:
        vertical['vertical_id'] = vertical['_id']
        result_v.append(dumps(vertical))

    return ({"status": "success", "tasks_list": result_v})

@app.route('/tasks/status', methods=['GET'])
def status():
    request_parameters = request.json

    print(request_parameters)

    result_v = []

    vertical_data = rnai.db.verticals.find({'admin_id': request_parameters['admin_id']})

    for vertical in vertical_data:
        vertical['vertical_id'] = vertical['_id']
        result_v.append(dumps(vertical))

    return jsonify({"status": "success", "tasks_list": result_v})

@app.route('/verticals/details', methods=['GET'])
def vertical_details():

    request_parameters = request.json

    print(request_parameters)

    output = {'vertical_id': None, 'vertical_name': None, 'status': None, 'papers': [], 'authors': [None]}

    papers_in_v = rnai.db.papers.find({'_vertical_id': ObjectId(request_parameters['vertical_id'])})

    vertical_data = rnai.db.verticals.find_one({'_id': ObjectId(request_parameters['vertical_id'])})

    output['vertical_name'] = vertical_data['name']
    output['status'] = vertical_data['status']

    for paper in papers_in_v:
        output['papers'].append(dumps([paper['_id'], paper['title']]))

    return jsonify({"status": "success", "vertical_details": output})

if __name__ == '__main__':
    app.run(debug = True, host= '0.0.0.0')