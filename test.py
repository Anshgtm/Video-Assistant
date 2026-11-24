from dotenv import load_dotenv
load_dotenv()
from utils.audio import process_input
import os
from core.translator import transcribe_all
os.getenv("SARVAM_API_KEY")
language = "hinglish"
source = "https://www.youtube.com/watch?v=_XV6Jz3Xg18"
chunks = process_input(source)
print(transcribe_all(chunks,language=language))
