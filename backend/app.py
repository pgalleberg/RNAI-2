from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_cors import cross_origin
import openai
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
# user = auth.get_user('FlWrr0rJgtgXLsp2vHAkL2Ef1u53')
# print('Successfully fetched user data: {0}'.format(user.uid))
# print(user.email)

app = Flask(__name__)
app.config['DEBUG'] = True
print("ORIGIN: ", os.getenv("ORIGIN"))
#CORS(app, resources={r"/*": {"origins": os.getenv("ORIGIN")}})
CORS(app, resources={r"/*": {"origins": "*"}})
openai.api_key = os.getenv("OPENAI_API_KEY")
print('openai.api_key: ', openai.api_key)

@app.route('/')
def hello():
    return "Hello, World!!!"

@app.route('/getGenericNames', methods=['GET'])
def getGenericNames():
    verticalName = request.args.get('verticalName')
    print("verticalName: ", verticalName)
    response = completion(verticalName)
    return parseResponse(response)
    

def completion(verticalName):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": createPrompt(verticalName)}
        ]
    )

    return response["choices"][0]["message"]["content"]


def createPrompt(verticalName):
        return '''I am looking for funding in the area of methane removal from ambient air. However, I am having trouble finding funding specifically for this area. Please give me five generic topics that would help me find funding for my area of interest. 

        List each topic on a new line without any bullet points. 
        
        Generic Topics:
        Climate change mitigation and adaptation
        Environmental sustainability and conservation
        Clean energy and renewable technologies
        Air pollution control and reduction
        Greenhouse gas emissions reduction and management
        
        I am looking for funding in the area of {}. However, I am having trouble finding funding specifically for this area. Please give me five generic topics that would help me find funding for my area of interest. 
        
        List each topic on a new line without any bullet points. 
        
        Generic Topics:'''.format(verticalName)
      
def parseResponse(response):
    return response.split('\n')


@app.route('/createAdmin', methods=['PATCH'])
def createAdmin():
    email = request.args.get('email')
    user = auth.get_user_by_email(email)
    uid = user.uid
    auth.set_custom_user_claims(uid, {'admin': True})
    
    response_data =  {"message": "User upgraded to super admin",
                      "email": email,
                      "uid": uid}
    
    return jsonify(response_data), 200



# @app.route('/verifyAdmin', methods=['GET'])
# def verifyAdmin():
#     user = request.args.get('uid')

#     if user.custom_claims.get('admin') is True:
#         return True
#     else:
#         return False


if __name__ == '__main__':
    app.run()
