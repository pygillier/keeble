from fastapi import APIRouter, Depends

from app.auth.deps import get_current_user
from app.models.document import Document
from app.models.user import User
from app.schemas.document import TagOut

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
async def list_tags(user: User = Depends(get_current_user)) -> list[TagOut]:
    match: dict = {"family_id": user.family_id}
    if user.role != "editor":
        match["status"] = "published"

    pipeline = [
        {"$match": match},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    results = await Document.aggregate(pipeline).to_list()
    return [TagOut(tag=result["_id"], count=result["count"]) for result in results]
