from datetime import datetime
from typing import Literal

from beanie import Document, PydanticObjectId
from pydantic import Field

from app.utils import utcnow

Role = Literal["reader", "editor"]


class User(Document):
    email: str
    password_hash: str
    display_name: str
    role: Role
    family_id: PydanticObjectId
    created_at: datetime = Field(default_factory=utcnow)

    class Settings:
        name = "users"
