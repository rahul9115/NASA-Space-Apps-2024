from flask import Flask,Response, jsonify, redirect, url_for, request
from flask_cors import CORS
import pandas as pd
import time as time_new
import json
import random
app = Flask(__name__)
CORS(app)
from AI_agent import *

@app.route("/ai_agent",methods=["GET","POST"])
def ai_agent_call():
    if request.method=="POST":
        data=request.json
        question=data["question"]
        print("The question",question)
        answer=ai_agent(question)
        print(answer)
        return jsonify({"answer":answer})
    else:
        return "Completed"

if __name__=="__main__":
    app.run(debug=True)
    


