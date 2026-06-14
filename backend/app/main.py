from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth.router import router as auth_router
from app.config import settings
from app.db import client, init_db
from app.routers.documents import router as documents_router
from app.routers.members import router as members_router
from app.routers.setup import router as setup_router
from app.routers.tags import router as tags_router
from app.routers.uploads import router as uploads_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Keeble API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(setup_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(tags_router, prefix="/api")
app.include_router(members_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")

Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.uploads_dir), name="uploads")


@app.get("/api/health")
async def health() -> dict[str, str]:
    await client.admin.command("ping")
    return {"status": "ok"}
