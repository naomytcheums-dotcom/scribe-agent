from fastapi import APIRouter

from app.config import settings
from app.schemas import ConfigStatusOut

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/config-status", response_model=ConfigStatusOut)
def config_status():
    return ConfigStatusOut(llm_configured=bool(settings.llm_api_key))
