from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Recording
from app.services.summarizer import generate_markdown_report, summarize_to_json
from app.services.transcription import transcribe_audio


def process_recording(recording_id: int, audio_bytes: bytes, filename: str) -> None:
    db: Session = SessionLocal()
    try:
        recording = db.get(Recording, recording_id)
        if not recording:
            return
        try:
            transcript = transcribe_audio(audio_bytes, filename)
            structured = summarize_to_json(transcript)
            markdown = generate_markdown_report(structured)

            recording.raw_transcript = transcript
            recording.title = structured.get("title", "") or "Untitled recording"
            recording.summary = structured.get("summary", "")
            recording.main_points = structured.get("main_points", []) or []
            recording.action_items = structured.get("action_items", []) or []
            recording.follow_up = structured.get("follow_up", []) or []
            recording.stories = structured.get("stories", []) or []
            recording.references = structured.get("references", []) or []
            recording.arguments = structured.get("arguments", []) or []
            recording.related_topics = structured.get("related_topics", []) or []
            recording.sentiment = structured.get("sentiment", "") or "neutral"
            recording.markdown_report = markdown
            recording.status = "completed"
        except Exception as exc:  # noqa: BLE001 — surfaced to the user via status field
            recording.status = "failed"
            recording.error_message = str(exc)
        db.commit()
    finally:
        db.close()
