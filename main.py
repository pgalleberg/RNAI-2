from flask import Flask, request, jsonify
from rnai.main import RNAI
from multiprocessing import Process
from bson.json_util import dumps

app = Flask(__name__)

rnai = RNAI(reset = False)

vertical_processes = {}

def vertical_creation_process(vertical_name, papers_list):
    rnai.initialise_vertical(vertical_name, papers_list)
    rnai.populate_verticals()

    rnai.rank_verticals()
    rnai.process_authors()
    rnai.populate_author_records()

@app.route('/tasks/initialise', methods=['POST'])
def initialise():

    request_parameters = request.json

    print(request_parameters)

    vertical_processes[request_parameters['query']] = Process(target=vertical_creation_process, kwargs=dict(vertical_name=request_parameters['query'], papers_list=request_parameters['papers']))

    vertical_processes[request_parameters['query']].start()   

    return jsonify({"status": "success"})

@app.route('/tasks/status', methods=['GET'])
def status():

    vertical_data = rnai.db.verticals.find({})

    result_v = []

    for vertical in vertical_data:
        result_v.append(dumps(vertical))

    return jsonify({"status": "success", "verticals": result_v})

if __name__ == '__main__':
    app.run(debug = True, host= '0.0.0.0')