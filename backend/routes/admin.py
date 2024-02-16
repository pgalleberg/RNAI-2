from flask import Blueprint, request, jsonify
from firebase_admin import auth, credentials, initialize_app

admin = Blueprint("admin", __name__)

cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)

@admin.route('/api/createAdmin', methods=['PATCH'])
def createAdmin():
    email = request.args.get('email')
    user = auth.get_user_by_email(email)
    uid = user.uid
    auth.set_custom_user_claims(uid, {'admin': True})
    
    response_data =  {"message": "User upgraded to super admin",
                      "email": email,
                      "uid": uid}
    
    return jsonify(response_data), 200


@admin.route('/api/verifyAdmin', methods=['GET'])
def verifyAdmin():
    uid = request.args.get('uid')
    user = auth.get_user(uid)
    print("user: ", user)
    print("user.custom_claims: ", user.custom_claims)

    isAdmin = False
    
    if user.custom_claims and 'admin' in user.custom_claims:
        isAdmin = True

    return jsonify({"admin": isAdmin}), 200


@admin.route('/api/approveUser', methods=['PATCH'])
def approveUser():

    try:
        email = request.args.get('email')
        user = auth.get_user_by_email(email)
        print("user: ", user)
        uid = user.uid
        print("uid: ", uid)
        auth.set_custom_user_claims(uid, {'approved': True})
        
        response_data =  {"message": "User has been approved",
                        "email": email,
                        "uid": uid}
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 404


@admin.route('/api/verifyUser', methods=['GET'])
def verifyUser():

    try:
        uid = request.args.get('uid')
        email = request.args.get('email')

        if uid:
            user = auth.get_user(uid)
        else:
            user = auth.get_user_by_email(email)

        print("user: ", user)
        print("user.custom_claims: ", user.custom_claims)
        
        isApproved = False

        if user.custom_claims and 'approved' in user.custom_claims:
            isApproved = True
    
        return jsonify({"approved": isApproved}), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 404
