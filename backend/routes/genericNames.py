from flask import Blueprint, request
from openai import OpenAI
import os

genericNames = Blueprint("genericNames", __name__)
client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

@genericNames.route('/api/getGenericNames', methods=['GET'])
def getGenericNames():
    verticalName = request.args.get('verticalName')
    print("verticalName: ", verticalName)
    response = completion(verticalName)
    return parseResponse(response)
    

def completion(verticalName):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": createPrompt(verticalName)}
        ]
    )

    return response.choices[0].message.content


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
        
        List each topic on a new line without any bullet points or numbering. 
        
        Generic Topics:'''.format(verticalName)
      
def parseResponse(response):
    parsedResponse = response.split('\n')
    parsedResponse = [response.strip() for response in parsedResponse]
    return parsedResponse