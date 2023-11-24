from flask import Blueprint, request, jsonify
from firebase_admin import auth, credentials, initialize_app

admin = Blueprint("admin", __name__)

cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)

@admin.route('/createAdmin', methods=['PATCH'])
def createAdmin():
    email = request.args.get('email')
    user = auth.get_user_by_email(email)
    uid = user.uid
    auth.set_custom_user_claims(uid, {'admin': True})
    
    response_data =  {"message": "User upgraded to super admin",
                      "email": email,
                      "uid": uid}
    
    return jsonify(response_data), 200



@admin.route('/verifyAdmin', methods=['GET'])
def verifyAdmin():

    uid = request.args.get('uid')
    user = auth.get_user(uid)
    print("user: ", user)

    if user.custom_claims:
        isAdmin = True
    else:
        isAdmin = False
    
    return jsonify({"admin": isAdmin}), 200