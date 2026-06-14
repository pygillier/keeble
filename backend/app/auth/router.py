from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError

from app.auth.cookies import REFRESH_TOKEN_COOKIE, clear_auth_cookies, set_auth_cookies
from app.auth.deps import get_current_user
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        family_id=str(user.family_id),
    )


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response) -> UserOut:
    user = await User.find_one(User.email == payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookies(response, access_token, refresh_token)

    return _user_out(user)


@router.post("/refresh", response_model=UserOut)
async def refresh(request: Request, response: Response) -> UserOut:
    token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")

    user = await User.get(PydanticObjectId(payload["sub"]))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookies(response, access_token, refresh_token)

    return _user_out(user)


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    clear_auth_cookies(response)
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return _user_out(user)
