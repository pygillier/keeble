import pytest
from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.config import settings
from app.models.document import Document
from app.models.family import Family
from app.models.user import User


@pytest.fixture(autouse=True)
async def configure_test_db():
    client = AsyncMongoClient(settings.mongo_uri)
    db = client[f"{settings.mongo_db_name}_test"]
    await init_beanie(database=db, document_models=[Family, User, Document])
    yield
    await client.drop_database(db.name)
    await client.close()
