import whisper
import os

WHISPER_MODEL = os.getenv("WHISPER_MODEL","small")
_model = None

def load_model():
    global _model
    if _model is None:
        print(f"loading model.....")
        _model = whisper.load_model(WHISPER_MODEL)
        print("model loader successfully")

    return _model   
def transcribe_chunk(chunk_path:str)->str:
    model = load_model()
    result = model.transcribe(chunk_path,task ="transcribe")
    return result["text"]

def transcribe_all(chunks:list)->str:
    full_transcript = ""
    for i, chunk in enumerate(chunks):
        print(f"transcribing chunk {i+1}")
        text = transcribe_chunk(chunk)
        full_transcript += text + ""
    print("transcription completed")
    return full_transcript



