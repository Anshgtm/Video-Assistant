import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

CHROME_DIR = "vector-db"
COLLECTION_NAME = "meeting-transcripts"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"}
        )
def build_vector(transcript: str) -> Chroma:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(transcript)
    docs = [
        Document(page_content=chunk) 
        for i ,chunk in enumerate(chunks)
        ]
    embeddings = get_embeddings()
    if os.path.exists(CHROME_DIR):
        existing = Chroma(
            persist_directory=CHROME_DIR,
            collection_name=COLLECTION_NAME,
            embedding_function=embeddings,
        )
        existing.delete_collection()
    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=CHROME_DIR,
        collection_name=COLLECTION_NAME
    )
    return vector_store
def load_vector() -> Chroma:
    embeddings = get_embeddings()
    vector_store = Chroma(
        persist_directory=CHROME_DIR,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings
    )
    return vector_store

def get_retriever(vector_store : Chroma, k :int = 4):
    return vector_store.as_retriever(
        search_type = 'similarity',
        search_kwargs = {"k":k}
    )


