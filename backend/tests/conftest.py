import pytest
from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.config import settings
from app.models.document import Document
from app.models.family import Family
from app.models.user import User
from tests.helpers import new_client


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
    async with new_client() as ac:
        yield ac
