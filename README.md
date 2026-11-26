An AI-powered video and audio intelligence tool designed to transcribe, translate, summarize, and query content from YouTube videos and local media files.

Built with a hybrid transcription architecture using OpenAI Whisper (for local English transcription) and Sarvam AI (for Hinglish / Indic speech-to-text and translation to English), backed by LangChain, Groq LLMs, a ChromaDB RAG pipeline, a FastAPI backend, and a React + TypeScript web interface.
1.Flexible Media Input: Accepts YouTube URLs
2.Automated Meeting Intelligence
3.RAG-Powered Q&A Chat
4.Web UI & CLI
Prerequisites
Python 3.10+
Node.js 18+ and npm
FFmpeg installed and available on your system PATH (required by pydub and yt-dlp)
Setup
1. Environment Variables

Create a .env file in the project root
GROQ_API_KEY="your_groq_api_key"
SARVAM_API_KEY="your_sarvam_api_key"
# Optional overrides
WHISPER_MODEL="small"
SARVAM_STT_MODEL="saaras:v2.5"

2. Backend Dependencies
uv pip install -r requirements.txt
uv pip install fastapi "uvicorn[standard]" python-multipart

3. Frontend Dependencies
cd frontend
npm install
