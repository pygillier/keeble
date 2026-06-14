from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.auth.cookies import REFRESH_TOKEN_COOKIE, clear_auth_cookies
from app.auth.deps import get_current_user, resolve_user_from_token
from app.auth.security import issue_tokens, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response) -> UserOut:
    user = await User.find_one(User.email == payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    issue_tokens(response, str(user.id))
    return UserOut.from_user(user)


@router.post("/refresh", response_model=UserOut)
async def refresh(request: Request, response: Response) -> UserOut:
    user = await resolve_user_from_token(
        request.cookies.get(REFRESH_TOKEN_COOKIE), "refresh"
    )
    issue_tokens(response, str(user.id))
    return UserOut.from_user(user)


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    clear_auth_cookies(response)
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.from_user(user)
