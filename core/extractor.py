from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import os

def get_llm():
    llm = os.getenv("GROQ_API_KEY")
    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.5,
        groq_api_key = llm
    )

def build_chain(system_prompt : str):
    llm = get_llm()
    return (
        RunnablePassthrough() | RunnableLambda(lambda x : {"text" : x}) |ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human","{text}"),
    ]) | llm |StrOutputParser()
    )
def extract_action_items(transcript:str)->str:
    system_prompt = (
        "You are an expert meeting summarizer. Extract all action items from the meeting transcript. "
        "Return the action items in a numbered list format, with each item starting with a verb. "
        "If there are no action items, return 'No action items found.'"
    )
    chain = build_chain(system_prompt)
    return chain.invoke(transcript)
def extract_decisions(transcript:str)->str:
    system_prompt = (
        "You are an expert meeting summarizer. Extract all decisions made during the meeting from the transcript. "
        "Return the decisions in a numbered list format. "
        "If there are no decisions, return 'No decisions found.'"
    )
    chain = build_chain(system_prompt)
    return chain.invoke(transcript)
def extract_questions(transcript:str)->str:
    system_prompt = (
        "You are an expert meeting summarizer. Extract all questions raised during the meeting from the transcript. "
        "Return the questions in a numbered list format. "
        "If there are no questions, return 'No questions found.'"
    )
    chain = build_chain(system_prompt)
    return chain.invoke(transcript)

