import os
import shutil
import uuid
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.extractor import (
    extract_action_items,
    extract_decisions,
    extract_questions,
)
from core.rag_engine import ask_question, build_rag_chain, load_rag_chain
from core.summariz import generate_title, summarize
from core.translator import transcribe_all
from core.vector_store import CHROME_DIR
from utils.audio import process_input

UPLOAD_DIR = os.path.join("downloads", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="AI Video Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_active_rag_chain = None


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


class ProcessResponse(BaseModel):
    title: str
    transcript: str
    summary: str
    action_items: str
    key_decisions: str
    open_questions: str
    language: str


def _run_full_pipeline(source: str, language: str) -> dict:
    global _active_rag_chain

    chunks = process_input(source)
    transcript = transcribe_all(chunks, language)
    if not transcript:
        raise ValueError("Transcription produced empty text.")

    title = generate_title(transcript)
    summary = summarize(transcript)
    action_items = extract_action_items(transcript)
    key_decisions = extract_decisions(transcript)
    open_questions = extract_questions(transcript)

    _active_rag_chain = build_rag_chain(transcript)

    return {
        "title": title,
        "transcript": transcript,
        "summary": summary,
        "action_items": action_items,
        "key_decisions": key_decisions,
        "open_questions": open_questions,
        "language": language,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/process", response_model=ProcessResponse)
async def process_media(
    source_url: Optional[str] = Form(default=None),
    language: str = Form(default="english"),
    file: Optional[UploadFile] = File(default=None),
):
    lang = (language or "english").strip().lower()
    if lang not in {"english", "hinglish"}:
        raise HTTPException(
            status_code=400,
            detail="Language must be 'english' or 'hinglish'.",
        )

    uploaded_path: Optional[str] = None
    if file is not None and file.filename:
        safe_name = os.path.basename(file.filename)
        unique_name = f"{uuid.uuid4().hex[:8]}_{safe_name}"
        uploaded_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(uploaded_path, "wb") as out:
            shutil.copyfileobj(file.file, out)
        source = uploaded_path
    elif source_url and source_url.strip():
        source = source_url.strip()
        if not (source.startswith("http://") or source.startswith("https://")):
            if not os.path.exists(source):
                raise HTTPException(
                    status_code=400,
                    detail=f"Local file not found: {source}",
                )
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide a YouTube URL, local file path, or upload a media file.",
        )

    try:
        result = await run_in_threadpool(_run_full_pipeline, source, lang)
        return ProcessResponse(**result)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_meeting(payload: ChatRequest):
    global _active_rag_chain

    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if _active_rag_chain is None:
        if os.path.exists(CHROME_DIR):
            _active_rag_chain = await run_in_threadpool(load_rag_chain)
        else:
            raise HTTPException(
                status_code=400,
                detail="No meeting has been processed yet. Analyze a video or audio file first.",
            )

    try:
        answer = await run_in_threadpool(ask_question, _active_rag_chain, question)
        return ChatResponse(answer=answer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
