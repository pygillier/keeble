from datetime import datetime
from typing import Literal

import pymongo
from beanie import Document as BeanieDocument
from beanie import PydanticObjectId
from pydantic import Field
from pymongo import IndexModel

from app.utils import utcnow

DocumentStatus = Literal["draft", "published"]


class Document(BeanieDocument):
    family_id: PydanticObjectId
    title: str
    slug: str
    tags: list[str] = []
    content_md: str = ""
    author_id: PydanticObjectId
    status: DocumentStatus = "draft"
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    class Settings:
        name = "documents"
        indexes = [
            IndexModel(
                [("family_id", pymongo.ASCENDING), ("slug", pymongo.ASCENDING)],
                unique=True,
            ),
            IndexModel(
                [
                    ("title", pymongo.TEXT),
                    ("content_md", pymongo.TEXT),
                    ("tags", pymongo.TEXT),
                ],
                name="document_text_search",
            ),
        ]
