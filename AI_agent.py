import os
from langchain.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.prompts.prompt import PromptTemplate
from langchain_core.tools import Tool
from langchain.agents import (
    create_react_agent,
    AgentExecutor
)
from langchain import hub
from langchain_community.utilities import SearchApiAPIWrapper
from dotenv import load_dotenv
import httpx
import ssl
import pandas as pd
import csv
import io
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)
load_dotenv()
http_client = httpx.Client(verify=False)
def lookup(question) :
    llm=ChatOpenAI(temperature=0)
    summary_template = """
    You are answering questions to help and solve problems for farmers. From that perspective try searcing an answer to this {question} from this website given below
    https://gpm.nasa.gov/applications/water
    """
    search = SearchApiAPIWrapper(http_client=http_client)
    summary_prompt_template = PromptTemplate(input_variables=["question"], template=summary_template)
    open_ai_key = os.environ['OPENAI_API_KEY']
    tools_for_agent=[
        Tool(
            name=f"Search for answers to farmers questions",
            func=search.run,
            description=f"Useful for getting answers for farmers question"
        )
    ]
    react_prompt=hub.pull("hwchase17/react")
    agent=create_react_agent(llm=llm,tools=tools_for_agent,prompt=react_prompt)
    agent_executor=AgentExecutor(agent=agent,tools=tools_for_agent,verbose=True,handle_parsing_errors=True)
    response=agent_executor.invoke(
        input={"input":summary_prompt_template.format_prompt(question=question)}
    )
    response=dict(response)
    return response["output"]

def ai_agent(question):
    ssl._create_default_https_context = ssl._create_unverified_context
    response=lookup(question=question)
    open_ai_key=os.environ['OPENAI_API_KEY']
    summary_template="""
    Based on the given information
    Information: {information} 
    summarize it and add your inputs to the answer as well.
    """
    summary_prompt_template= PromptTemplate(template=summary_template)
    llm=ChatOpenAI(temperature=0,http_client=http_client)
    chain=summary_prompt_template|llm 
    res=chain.invoke(input={"information":response})
    res=str(res).split("'")[1]
    return res

if __name__=="__main__":
    print("Langchain")
    load_dotenv()
    abs_path=os.getcwd()
    print(abs_path)
    ai_agent("Which is the most water scarce country?")
    