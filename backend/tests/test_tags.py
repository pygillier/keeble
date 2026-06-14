import pytest
from httpx import AsyncClient

from tests.helpers import setup_family


@pytest.mark.asyncio
async def test_list_tags_with_counts(client: AsyncClient) -> None:
    await setup_family(client)
    await client.post(
        "/api/documents",
        json={"title": "Doc A", "tags": ["network", "router"], "status": "published"},
    )
    await client.post(
        "/api/documents",
        json={"title": "Doc B", "tags": ["network"], "status": "draft"},
    )

    response = await client.get("/api/tags")
    tags = {item["tag"]: item["count"] for item in response.json()}
    assert tags == {"network": 2, "router": 1}
