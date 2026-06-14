from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.deps import require_editor
from app.auth.security import hash_password
from app.models.user import User
from app.schemas.member import MemberCreate, MemberOut, MemberUpdate

router = APIRouter(prefix="/members", tags=["members"])


def _member_out(member: User) -> MemberOut:
    return MemberOut(
        id=str(member.id),
        email=member.email,
        display_name=member.display_name,
        role=member.role,
    )


async def _get_family_member(member_id: PydanticObjectId, family_id) -> User:
    member = await User.find_one(User.id == member_id, User.family_id == family_id)
    if member is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")
    return member


@router.get("", response_model=list[MemberOut])
async def list_members(user: User = Depends(require_editor)) -> list[MemberOut]:
    members = await User.find(User.family_id == user.family_id).to_list()
    return [_member_out(member) for member in members]


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
async def create_member(
    payload: MemberCreate, user: User = Depends(require_editor)
) -> MemberOut:
    if await User.find_one(User.email == payload.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already in use")

    member = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
        role=payload.role,
        family_id=user.family_id,
    )
    await member.insert()
    return _member_out(member)


@router.patch("/{member_id}", response_model=MemberOut)
async def update_member(
    member_id: PydanticObjectId,
    payload: MemberUpdate,
    user: User = Depends(require_editor),
) -> MemberOut:
    member = await _get_family_member(member_id, user.family_id)

    updates = payload.model_dump(exclude_unset=True)
    if member.id == user.id and updates.get("role") == "reader":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "You can't change your own role"
        )

    password = updates.pop("password", None)
    if password:
        member.password_hash = hash_password(password)
    for field, value in updates.items():
        setattr(member, field, value)
    await member.save()
    return _member_out(member)


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: PydanticObjectId, user: User = Depends(require_editor)
) -> None:
    if member_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't remove yourself")
    member = await _get_family_member(member_id, user.family_id)
    await member.delete()
