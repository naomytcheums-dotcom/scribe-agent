from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import sync_schema
from app.routers import recordings, status_router

app = FastAPI(title="Scribe Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(status_router.router)
app.include_router(recordings.router)


@app.on_event("startup")
def on_startup():
    sync_schema()


@app.get("/api/health")
def health():
    return {"status": "ok"}
