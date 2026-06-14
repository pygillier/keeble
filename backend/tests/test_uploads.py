import pytest
from httpx import AsyncClient

from tests.helpers import setup_family


@pytest.mark.asyncio
async def test_upload_image(client: AsyncClient) -> None:
    await setup_family(client)

    files = {"file": ("photo.png", b"fake-png-bytes", "image/png")}
    response = await client.post("/api/uploads", files=files)

    assert response.status_code == 201
    body = response.json()
    assert body["url"].startswith("/uploads/")
    assert body["url"].endswith(".png")


@pytest.mark.asyncio
async def test_upload_rejects_unsupported_content_type(client: AsyncClient) -> None:
    await setup_family(client)

    files = {"file": ("notes.txt", b"hello", "text/plain")}
    response = await client.post("/api/uploads", files=files)

    assert response.status_code == 400
