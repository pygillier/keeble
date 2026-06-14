import pytest
from beanie import init_beanie
from httpx import ASGITransport, AsyncClient
from pymongo import AsyncMongoClient

from app.config import settings
from app.main import app
from app.models.document import Document
from app.models.family import Family
from app.models.user import User


@pytest.fixture(autouse=True)
async def configure_test_db(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "uploads_dir", str(tmp_path / "uploads"))

    client = AsyncMongoClient(settings.mongo_uri)
    db = client[f"{settings.mongo_db_name}_test"]
    await init_beanie(database=db, document_models=[Family, User, Document])
    yield
    await client.drop_database(db.name)
    await client.close()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
