import json
import re

from app.config import settings
from app.services.llm_client import get_client

SUMMARY_SYSTEM_PROMPT = """## ROLE
You are an expert at summarizing long transcripts.

## TASK
Summarize the provided transcript into a structured JSON report.

## RULES
Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "title": "short descriptive title",
  "summary": "a few sentences summarizing the recording",
  "main_points": ["item 1", "item 2"],
  "action_items": ["item 1", "item 2"],
  "follow_up": ["item 1", "item 2"],
  "stories": ["item 1", "item 2"],
  "references": ["item 1", "item 2"],
  "arguments": ["item 1", "item 2"],
  "related_topics": ["item 1", "item 2"],
  "sentiment": "positive, neutral, or negative"
}
Use empty arrays for any category with nothing relevant. Never omit a key."""

MARKDOWN_SYSTEM_PROMPT = """Convert this structured transcript summary into a clean,
readable Markdown report. Use headers for each non-empty section, bullet points for
lists, and bold the key decisions. Respond with only the Markdown text, no code fences."""


def _strip_code_fence(text: str) -> str:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return match.group(0) if match else text


def summarize_to_json(transcript: str) -> dict:
    client = get_client()
    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
            {"role": "user", "content": f"Transcript:\n{transcript}"},
        ],
        temperature=0.4,
        max_tokens=1536,
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(_strip_code_fence(content))
    except json.JSONDecodeError:
        return {
            "title": "Untitled recording",
            "summary": content.strip()[:500],
            "main_points": [],
            "action_items": [],
            "follow_up": [],
            "stories": [],
            "references": [],
            "arguments": [],
            "related_topics": [],
            "sentiment": "neutral",
        }


def generate_markdown_report(structured: dict) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": MARKDOWN_SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(structured)},
        ],
        temperature=0.4,
        max_tokens=1536,
    )
    return (response.choices[0].message.content or "").strip()
