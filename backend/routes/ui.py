from flask import Blueprint, request, jsonify
import requests
from bson.objectid import ObjectId
from config import db
import os

ui = Blueprint("ui", __name__)
webserver = os.getenv('WEBSERVER')

@ui.route('/tasks', methods=['GET'])
def getTasks():
    uid = request.args.get('uid')
    print('uid: ', uid)

    collection = db['verticals']
    
    #check if the uid belongs to the admin
    url = webserver + 'verifyAdmin?uid=' + uid
    print("getTasks::url: ", url)
    response = requests.get(url)
    isAdmin = response.json()['admin']
    print("getTasks::isAdmin: ", isAdmin)
    
    if (not isAdmin):
        query = {"user.uid": uid}
    else:
        query = {}
    
    result_set = list(collection.find(query))
        
    for result in result_set:
        print(result)

    for result in result_set:
        result['_id'] = str(result['_id'])

    return jsonify(result_set), 200

@ui.route('/task', methods=['GET'])
def getTask():
    id = request.args.get('id')
    print('tasks::id: ', id)

    collection = db["verticals"]
    id = ObjectId(id)
    result = collection.find_one({"_id": id})
    result['_id'] = str(result['_id'])
    #print("task::result: ", result)

    # return jsonify(list(result)), 200
    return jsonify(result), 200

@ui.route('/pending_tasks', methods=['POST'])
def getPendingTasks():
    print("request.json: ", request.json)
    print("request: ", request)
    print("request.data: ", request.data)

    result_set = []
    for id in request.json:
        id = ObjectId(id)
        query = {"_id": id}
        collection = db["verticals"]
        result = collection.find_one(query)
        result['_id'] = str(result['_id'])
        print("result: ", result)
        result_set.append(result)

    print("result_set: ", result_set)

    latest_statuses = {}
    for result in result_set:
        latest_statuses[result['_id']] = result['status']

    return jsonify(latest_statuses), 200

@ui.route('/vertical_details', methods=['GET'])
def getVerticalDetails():
    id = request.args.get('id')

    # get all the papers w.r.t. vertical id
    print('vertical_details::id: ', id)

    collection = db['papers']
    # id = ObjectId(id)
    query = {
        "vertical_id": id,
        "depth": 0
    }

    result_set = list(collection.find(query))
    
    for paper in result_set:
        paper['_id'] = str(paper['_id'])

    print("getVerticalDetails::result_set: ", result_set)

    return jsonify(result_set), 200

@ui.route('/paper_details', methods=['GET'])
def getPaperDetails():
    id = request.args.get('id')
    print('paper_details::id: ', id)

    collection = db['papers']
    query = {
        "_id": ObjectId(id),
    }


    paper_details = collection.find_one(query)
    print("getPaperDetails::paper_details: ", paper_details)
    paper_details['_id'] = str(paper_details['_id'])
    print("getPaperDetails::paper_details: ", paper_details)

    return jsonify(paper_details), 200


@ui.route('/author_details', methods=['GET'])
def getAuthorDetails():
    id = request.args.get('id')
    print('author_details::id: ', id)

    collection = db['authors']
    query = {
        "authorId": id,
    }


    author_details = collection.find_one(query)
    print("getAuthorDetails::author_details: ", author_details)
    author_details['_id'] = str(author_details['_id'])
    print("getAuthorDetails::author_details: ", author_details)

    return jsonify(author_details), 200
