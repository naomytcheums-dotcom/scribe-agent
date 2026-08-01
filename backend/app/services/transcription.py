import io

from app.config import settings
from app.services.llm_client import get_client


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    client = get_client()
    file_obj = io.BytesIO(audio_bytes)
    file_obj.name = filename
    response = client.audio.transcriptions.create(model=settings.transcription_model, file=file_obj)
    return response.text.strip()
