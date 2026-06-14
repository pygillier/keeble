from pydantic import BaseModel, EmailStr

from app.models.user import Role, User


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    role: Role
    family_id: str

    @classmethod
    def from_user(cls, user: User) -> "UserOut":
        return cls(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            role=user.role,
            family_id=str(user.family_id),
        )


class SetupRequest(BaseModel):
    family_name: str
    email: EmailStr
    password: str
    display_name: str


class SetupStatusResponse(BaseModel):
    needs_setup: bool
