import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.auth.deps import require_editor
from app.config import settings
from app.models.user import User
from app.schemas.upload import UploadOut

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_CONTENT_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile, user: User = Depends(require_editor)
) -> UploadOut:
    extension = ALLOWED_CONTENT_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unsupported file type")

    family_dir = Path(settings.uploads_dir) / str(user.family_id)
    family_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"
    content = await file.read()
    (family_dir / filename).write_bytes(content)

    return UploadOut(url=f"/uploads/{user.family_id}/{filename}")
