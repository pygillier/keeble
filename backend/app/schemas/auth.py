from pydantic import BaseModel, EmailStr

from app.models.user import Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    role: Role
    family_id: str


class SetupRequest(BaseModel):
    family_name: str
    email: EmailStr
    password: str
    display_name: str


class SetupStatusResponse(BaseModel):
    needs_setup: bool
