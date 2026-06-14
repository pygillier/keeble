from datetime import datetime, timezone
from typing import Literal

from beanie import Document as BeanieDocument
from beanie import Link
from pydantic import Field

from app.models.family import Family
from app.models.user import User

DocumentStatus = Literal["draft", "published"]


class Document(BeanieDocument):
    family_id: Link[Family]
    title: str
    slug: str
    tags: list[str] = []
    content_md: str = ""
    author_id: Link[User]
    status: DocumentStatus = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "documents"
