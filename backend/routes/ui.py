from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from config import db
import os
from pymongo import ReturnDocument, DESCENDING, ASCENDING

ui = Blueprint("ui", __name__)
webserver = os.getenv('WEBSERVER')

@ui.route('/api/tasks', methods=['GET'])
def getTasks():
    uid = request.args.get('uid')
    print('getTasks::uid: ', uid)

    collection = db['verticals']
    
    #check if the uid belongs to the admin
    # url = webserver + 'verifyAdmin?uid=' + uid
    # print("getTasks::url: ", url)
    # response = requests.get(url)
    # isAdmin = response.json()['admin']
    # print("getTasks::isAdmin: ", isAdmin)
    
    # if (not isAdmin):
    #     query = {"user.uid": uid}
    # else:
    #     query = {}
    
    query = {"user.uid": uid}
    result_set = list(collection.find(query))
        
    for result in result_set:
        result['_id'] = str(result['_id'])

    return jsonify(result_set), 200

@ui.route('/api/task', methods=['GET'])
def getTask():
    id = request.args.get('id')
    print('getTask::id: ', id)

    collection = db["verticals"]
    id = ObjectId(id)
    result = collection.find_one({"_id": id})
    result['_id'] = str(result['_id'])

    return jsonify(result), 200


@ui.route('/api/vertical_details', methods=['GET'])
def getVerticalDetails():
    id = request.args.get('id')

    # get all the papers w.r.t. vertical id
    print('getVerticalDetails::id: ', id)

    collection = db['papers']
    # id = ObjectId(id)
    query = {
        "vertical_id": id,
        # "depth": 0
    }

    result_set = list(collection.find(query).sort('rank', ASCENDING))
    
    for paper in result_set:
        paper['_id'] = str(paper['_id'])

    print("getVerticalDetails::result_set: ", result_set)

    return jsonify(result_set), 200

@ui.route('/api/paper_details', methods=['GET'])
def getPaperDetails():
    paper_id = request.args.get('paper_id')
    vertical_id = request.args.get('vertical_id')

    print('getPaperDetails::paper_id: ', paper_id)
    print('getPaperDetails::vertical_id: ', vertical_id)

    collection = db['papers']
    query = {
        "paperId": paper_id,
        "vertical_id": vertical_id,
        # "depth": 0
    }
   
    paper_details = collection.find_one(query)

    # if paper_details == None:
    #     query["depth"] = query["depth"] + 1
    #     paper_details = collection.find_one(query)

    paper_details['_id'] = str(paper_details['_id'])
    print("getPaperDetails::paper_details: ", paper_details)

    return jsonify(paper_details), 200


@ui.route('/api/author_details', methods=['GET'])
def getAuthorDetails():
    author_id = request.args.get('author_id')
    vertical_id = request.args.get('vertical_id')

    print('getAuthorDetails::author_id: ', author_id)
    print('getAuthorDetails::vertical_id: ', vertical_id)

    collection = db['authors']
    # first find author at depth 0 - could be multiple records
    query = {
        "authorId": author_id,
        "vertical_id": vertical_id,
        # "depth": 0
    }

    author_details_depth_0 = collection.find(query)
    author_details_depth_0 = list(author_details_depth_0)
    print("getAuthorDetails::author_details_depth_0: ", author_details_depth_0)

    # find author at depth 1 
    # query["depth"] = 1
    # author_details_depth_1 = collection.find(query)
    # author_details_depth_1 = list(author_details_depth_1)
    
    # combine source papers
    author_details = author_details_depth_0 #+ author_details_depth_1
    source_papers = {}
    for record in author_details:
        for source_paper in record['source_papers']:
            paper_id = source_paper['id']
            paper_title = source_paper['title']
            paper_citationCount = source_paper['citationCount']
            paper_influentialCitationCount = source_paper['influentialCitationCount']
            source_papers[paper_id] = {'title': paper_title, 'citationCount': paper_citationCount, 'influentialCitationCount': paper_influentialCitationCount}

    print("getAuthorDetails::source_papers: ", source_papers)

    author = author_details[0]
    author['source_papers'] = source_papers
    author['_id'] = str(author['_id'])
    print("getAuthorDetails::author: ", author)

    return jsonify(author), 200


@ui.route('/api/funding_details', methods=["GET"])
def getFundingDetails():
    id = request.args.get('id')
    print('getFundingDetails::id: ', id)
    
    collection = db['funding']
    query = {
        "vertical_id": id    
    }

    funding_details = collection.find(query).sort('score', DESCENDING)
    funding_details = list(funding_details)
    funding_details_dict = {}

    for funding in funding_details:
        funding['_id'] = str(funding['_id'])
        if funding_details_dict.get(funding['search_term'], -1) != -1:
            funding_details_dict[funding['search_term']].append(funding)
        else:
            funding_details_dict[funding['search_term']] = [funding]


    print("getFundingDetails::funding_details_dict: ", funding_details_dict)

    return jsonify(funding_details_dict), 200


@ui.route('/api/grant_details', methods=["GET"])
def getGrantDetails():
    id = request.args.get('grant_id')
    print('getGrantDetails::id: ', id)
    
    collection = db['funding']
    query = {
        "id": id    
    }

    grant_details = collection.find_one(query)
    grant_details['_id'] = str(grant_details['_id'])
    print("getGrantDetails::grant_details: ", grant_details)

    return jsonify(grant_details), 200


@ui.route('/api/patent_details', methods=["GET"])
def getPatentDetails():
    id = request.args.get('id')
    print('getPatentDetails::id: ', id)
    collection = db['patents']
    query = {
        "vertical_id": id    
    }

    patent_details = collection.find(query).sort('rank', ASCENDING)
    patent_details = list(patent_details)

    for patent in patent_details:
        patent['_id'] = str(patent['_id'])

    print("getPatentDetails::patent_details: ", patent_details)

    return jsonify(patent_details), 200


@ui.route('/api/individual_patent_details', methods=["GET"])
def getIndividualPatentDetails():
    vertical_id = request.args.get('vertical_id')
    print('getIndividualPatentDetails::vertical_id: ', vertical_id)
    patent_id = request.args.get('patent_id')
    print('getIndividualPatentDetails::patent_id: ', patent_id)
    collection = db['patents']
    query = {
        "vertical_id": vertical_id,
        "patent_id": 'patent/' + patent_id + '/en'
    }

    patent_details = collection.find_one(query)
    patent_details['_id'] = str(patent_details['_id'])

    print("getIndividualPatentDetails::patent_details: ", patent_details)

    return jsonify(patent_details), 200


@ui.route('/api/inventor_details', methods=['GET'])
def getInventorDetails():
    inventor_name = request.args.get('inventor_name')
    vertical_id = request.args.get('vertical_id')

    print('getInventorDetails::inventor_name: ', inventor_name)
    print('getInventorDetails::vertical_id: ', vertical_id)

    collection = db['inventors']
    query = {
        "name": inventor_name,
        "vertical_id": vertical_id,
    }

    inventor_details = collection.find(query)
    inventor_details = list(inventor_details)
    print("getInventorDetails::inventor_details: ", inventor_details)
    
    source_patents = {}
    for record in inventor_details:
        for source_patent in record['source_patents']:
            patent_id = source_patent['patent_id']
            patent_title = source_patent['title']
            source_patents[patent_id] = {'title': patent_title}
            # source_papers[paper_id] = {'title': paper_title, 'citationCount': paper_citationCount, 'influentialCitationCount': paper_influentialCitationCount}


    print("getInventorDetails::source_patents: ", source_patents)

    inventor = inventor_details[0]
    inventor['source_patents'] = source_patents
    inventor['_id'] = str(inventor['_id'])
    print("getInventorDetails::inventor: ", inventor)

    return jsonify(inventor), 200


@ui.route('/api/update_vertical', methods=['PATCH'])
def updateVertical():
    body = request.json    
    print("updateVertical::body: ", body)

    collection = db['verticals']
    query = {
        "_id": ObjectId(body['_id'])
    }
    update = {
        "$set": {
            "status": body['status']
        }
    }

    updated_document = collection.find_one_and_update(query, update, return_document=ReturnDocument.AFTER)
    updated_document["_id"] = str(updated_document["_id"])

    return updated_document, 200


@ui.route('/api/delete_vertical/<string:vertical_id>', methods=['DELETE'])
def deleteVertical(vertical_id):
    print("vertical_id: {} received".format(vertical_id))
    db['verticals'].delete_one({"_id": ObjectId(vertical_id)})
    
    collections = ['authors', 'funding', 'inventors', 'papers', 'patents']
    for collection in collections:
        query = {
            "vertical_id": vertical_id
        }
        try:
            db[collection].delete_many(query)
            print("deleting from collection: {}".format(collection))
        except Exception as e:
            print("exception::e:{}".format(e))

    return jsonify({"message": "Vertical deleted successfully!"}), 200