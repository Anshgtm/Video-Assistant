from utils.audio import process_input
from core.translator import transcribe_all
source = "https://www.youtube.com/watch?v=_XV6Jz3Xg18"
chunks = process_input(source)
print(transcribe_all(chunks))
