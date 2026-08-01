from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RecordingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_name: str
    status: str
    title: str
    sentiment: str
    created_at: datetime


class RecordingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_name: str
    status: str
    error_message: str
    raw_transcript: str
    title: str
    summary: str
    main_points: list[str]
    action_items: list[str]
    follow_up: list[str]
    stories: list[str]
    references: list[str]
    arguments: list[str]
    related_topics: list[str]
    sentiment: str
    markdown_report: str
    created_at: datetime


class ConfigStatusOut(BaseModel):
    llm_configured: bool
