from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError

from app.auth.cookies import ACCESS_TOKEN_COOKIE
from app.auth.security import decode_token
from app.models.user import User


async def resolve_user_from_token(token: str | None, expected_type: str) -> User:
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    if payload.get("type") != expected_type:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")

    user = await User.get(PydanticObjectId(payload["sub"]))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    return user


async def get_current_user(request: Request) -> User:
    return await resolve_user_from_token(
        request.cookies.get(ACCESS_TOKEN_COOKIE), "access"
    )


async def require_editor(user: User = Depends(get_current_user)) -> User:
    if user.role != "editor":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Editor role required")
    return user
