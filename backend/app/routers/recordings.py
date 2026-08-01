from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app.auth import require_site_password
from app.database import get_db
from app.models import Recording
from app.schemas import RecordingDetailOut, RecordingListOut
from app.services.pipeline import process_recording

router = APIRouter(prefix="/api/recordings", tags=["recordings"], dependencies=[Depends(require_site_password)])


@router.post("", response_model=RecordingListOut)
async def upload_recording(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(400, "Empty file.")

    recording = Recording(original_name=file.filename or "recording", status="pending")
    db.add(recording)
    db.commit()
    db.refresh(recording)

    background_tasks.add_task(process_recording, recording.id, audio_bytes, file.filename or "recording")

    return recording


@router.get("", response_model=list[RecordingListOut])
def list_recordings(db: Session = Depends(get_db)):
    return db.query(Recording).order_by(Recording.created_at.desc()).all()


@router.get("/{recording_id}", response_model=RecordingDetailOut)
def get_recording(recording_id: int, db: Session = Depends(get_db)):
    recording = db.get(Recording, recording_id)
    if not recording:
        raise HTTPException(404, "Recording not found.")
    return recording


@router.delete("/{recording_id}")
def delete_recording(recording_id: int, db: Session = Depends(get_db)):
    recording = db.get(Recording, recording_id)
    if not recording:
        raise HTTPException(404, "Recording not found.")
    db.delete(recording)
    db.commit()
    return {"ok": True}


@router.get("/{recording_id}/markdown")
def download_markdown(recording_id: int, db: Session = Depends(get_db)):
    recording = db.get(Recording, recording_id)
    if not recording:
        raise HTTPException(404, "Recording not found.")
    return Response(
        content=recording.markdown_report,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{recording.title or "report"}.md"'},
    )


@router.get("/{recording_id}/transcript")
def download_transcript(recording_id: int, db: Session = Depends(get_db)):
    recording = db.get(Recording, recording_id)
    if not recording:
        raise HTTPException(404, "Recording not found.")
    return Response(
        content=recording.raw_transcript,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{recording.title or "transcript"}.txt"'},
    )
