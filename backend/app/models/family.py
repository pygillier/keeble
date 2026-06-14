from datetime import datetime

from beanie import Document
from pydantic import Field

from app.utils import utcnow


class Family(Document):
    name: str
    created_at: datetime = Field(default_factory=utcnow)

    class Settings:
        name = "families"
