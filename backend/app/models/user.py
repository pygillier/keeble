from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pydantic import Field

Role = Literal["reader", "editor"]


class User(Document):
    email: str
    password_hash: str
    display_name: str
    role: Role
    family_id: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
