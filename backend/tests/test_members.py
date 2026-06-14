import pytest
from httpx import AsyncClient

from tests.helpers import setup_family


@pytest.mark.asyncio
async def test_member_lifecycle(client: AsyncClient) -> None:
    await setup_family(client)

    create = await client.post(
        "/api/members",
        json={
            "email": "kid@example.com",
            "password": "supersecret",
            "display_name": "Kid",
            "role": "reader",
        },
    )
    assert create.status_code == 201
    member_id = create.json()["id"]

    members = await client.get("/api/members")
    assert len(members.json()) == 2

    update = await client.patch(f"/api/members/{member_id}", json={"role": "editor"})
    assert update.status_code == 200
    assert update.json()["role"] == "editor"

    delete = await client.delete(f"/api/members/{member_id}")
    assert delete.status_code == 204

    members_after = await client.get("/api/members")
    assert len(members_after.json()) == 1


@pytest.mark.asyncio
async def test_member_email_must_be_unique(client: AsyncClient) -> None:
    await setup_family(client)

    response = await client.post(
        "/api/members",
        json={
            "email": "admin@example.com",
            "password": "supersecret",
            "display_name": "Admin 2",
            "role": "reader",
        },
    )
    assert response.status_code == 409
