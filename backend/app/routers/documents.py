import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.deps import get_current_user, require_editor
from app.models.document import Document, DocumentStatus
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentOut, DocumentUpdate

router = APIRouter(prefix="/documents", tags=["documents"])


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "untitled"


async def _unique_slug(family_id, title: str) -> str:
    base_slug = _slugify(title)
    slug = base_slug
    suffix = 2
    while await Document.find_one(
        Document.family_id == family_id, Document.slug == slug
    ):
        slug = f"{base_slug}-{suffix}"
        suffix += 1
    return slug


def _doc_out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=str(doc.id),
        title=doc.title,
        slug=doc.slug,
        tags=doc.tags,
        content_md=doc.content_md,
        author_id=str(doc.author_id),
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


async def _get_visible_document(slug: str, user: User) -> Document:
    doc = await Document.find_one(
        Document.family_id == user.family_id, Document.slug == slug
    )
    if doc is None or (doc.status != "published" and user.role != "editor"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return doc


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    status_filter: DocumentStatus | None = Query(default=None, alias="status"),
    tag: str | None = None,
    q: str | None = None,
    user: User = Depends(get_current_user),
) -> list[DocumentOut]:
    query: dict = {"family_id": user.family_id}

    if user.role == "editor":
        if status_filter is not None:
            query["status"] = status_filter
    else:
        query["status"] = "published"

    if tag:
        query["tags"] = tag

    if q:
        query["$text"] = {"$search": q}

    docs = await Document.find(query).to_list()
    return [_doc_out(doc) for doc in docs]


@router.get("/{slug}", response_model=DocumentOut)
async def get_document(
    slug: str, user: User = Depends(get_current_user)
) -> DocumentOut:
    doc = await _get_visible_document(slug, user)
    return _doc_out(doc)


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate, user: User = Depends(require_editor)
) -> DocumentOut:
    slug = await _unique_slug(user.family_id, payload.title)
    doc = Document(
        family_id=user.family_id,
        title=payload.title,
        slug=slug,
        tags=payload.tags,
        content_md=payload.content_md,
        author_id=user.id,
        status=payload.status,
    )
    await doc.insert()
    return _doc_out(doc)


@router.put("/{slug}", response_model=DocumentOut)
async def update_document(
    slug: str, payload: DocumentUpdate, user: User = Depends(require_editor)
) -> DocumentOut:
    doc = await Document.find_one(
        Document.family_id == user.family_id, Document.slug == slug
    )
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    doc.updated_at = datetime.now(timezone.utc)
    await doc.save()
    return _doc_out(doc)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(slug: str, user: User = Depends(require_editor)) -> None:
    doc = await Document.find_one(
        Document.family_id == user.family_id, Document.slug == slug
    )
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    await doc.delete()
