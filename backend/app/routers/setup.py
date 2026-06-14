from fastapi import APIRouter, HTTPException, Response, status

from app.auth.cookies import set_auth_cookies
from app.auth.security import create_access_token, create_refresh_token, hash_password
from app.models.family import Family
from app.models.user import User
from app.schemas.auth import SetupRequest, SetupStatusResponse, UserOut

router = APIRouter(tags=["setup"])


@router.get("/setup/status", response_model=SetupStatusResponse)
async def setup_status() -> SetupStatusResponse:
    existing = await Family.find_one({})
    return SetupStatusResponse(needs_setup=existing is None)


@router.post("/setup", response_model=UserOut)
async def setup(payload: SetupRequest, response: Response) -> UserOut:
    if await Family.find_one({}) is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Setup has already been completed"
        )

    family = Family(name=payload.family_name)
    await family.insert()

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
        role="editor",
        family_id=family,
    )
    await user.insert()

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookies(response, access_token, refresh_token)

    return UserOut(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        family_id=str(family.id),
    )
