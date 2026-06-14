from datetime import datetime

from pydantic import BaseModel

from app.models.document import DocumentStatus


class DocumentCreate(BaseModel):
    title: str
    tags: list[str] = []
    content_md: str = ""
    status: DocumentStatus = "draft"


class DocumentUpdate(BaseModel):
    title: str | None = None
    tags: list[str] | None = None
    content_md: str | None = None
    status: DocumentStatus | None = None


class DocumentOut(BaseModel):
    id: str
    title: str
    slug: str
    tags: list[str]
    content_md: str
    author_id: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime


class TagOut(BaseModel):
    tag: str
    count: int
