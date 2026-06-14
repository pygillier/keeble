from pydantic import BaseModel, EmailStr

from app.models.user import Role


class MemberCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    role: Role = "reader"


class MemberUpdate(BaseModel):
    display_name: str | None = None
    role: Role | None = None
    password: str | None = None


class MemberOut(BaseModel):
    id: str
    email: str
    display_name: str
    role: Role
