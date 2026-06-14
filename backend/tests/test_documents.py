import pytest
from httpx import AsyncClient

from app.auth.security import hash_password
from app.models.family import Family
from app.models.user import User
from tests.helpers import new_client, setup_family


@pytest.mark.asyncio
async def test_create_and_get_document(client: AsyncClient) -> None:
    await setup_family(client)

    create = await client.post(
        "/api/documents",
        json={
            "title": "Router Reboot",
            "tags": ["network"],
            "content_md": "## Step 1\nUnplug it",
            "status": "published",
        },
    )
    assert create.status_code == 201
    body = create.json()
    assert body["slug"] == "router-reboot"
    assert body["status"] == "published"

    get_response = await client.get(f"/api/documents/{body['slug']}")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Router Reboot"


@pytest.mark.asyncio
async def test_duplicate_titles_get_unique_slugs(client: AsyncClient) -> None:
    await setup_family(client)

    first = await client.post("/api/documents", json={"title": "Wifi Setup"})
    second = await client.post("/api/documents", json={"title": "Wifi Setup"})

    assert first.json()["slug"] == "wifi-setup"
    assert second.json()["slug"] == "wifi-setup-2"


@pytest.mark.asyncio
async def test_update_and_delete_document(client: AsyncClient) -> None:
    await setup_family(client)
    create = await client.post("/api/documents", json={"title": "Boiler Reset"})
    slug = create.json()["slug"]

    update = await client.put(
        f"/api/documents/{slug}",
        json={"content_md": "## Step 1\nPress reset", "status": "published"},
    )
    assert update.status_code == 200
    assert update.json()["content_md"] == "## Step 1\nPress reset"
    assert update.json()["status"] == "published"

    delete = await client.delete(f"/api/documents/{slug}")
    assert delete.status_code == 204

    missing = await client.get(f"/api/documents/{slug}")
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_list_documents_filters_by_status_and_tag(client: AsyncClient) -> None:
    await setup_family(client)
    await client.post(
        "/api/documents",
        json={
            "title": "Published Guide",
            "tags": ["appliances"],
            "status": "published",
        },
    )
    await client.post(
        "/api/documents",
        json={"title": "Draft Guide", "tags": ["network"], "status": "draft"},
    )

    all_docs = await client.get("/api/documents")
    assert len(all_docs.json()) == 2

    published_only = await client.get("/api/documents", params={"status": "published"})
    assert [d["title"] for d in published_only.json()] == ["Published Guide"]

    by_tag = await client.get("/api/documents", params={"tag": "network"})
    assert [d["title"] for d in by_tag.json()] == ["Draft Guide"]


@pytest.mark.asyncio
async def test_search_documents(client: AsyncClient) -> None:
    await setup_family(client)
    await client.post(
        "/api/documents",
        json={
            "title": "Router Reboot",
            "content_md": "Unplug the router",
            "status": "published",
        },
    )
    await client.post(
        "/api/documents",
        json={
            "title": "Insurance Provider",
            "content_md": "Call the agent",
            "status": "published",
        },
    )

    response = await client.get("/api/documents", params={"q": "router"})
    titles = [d["title"] for d in response.json()]
    assert titles == ["Router Reboot"]


@pytest.mark.asyncio
async def test_reader_sees_only_published_and_cannot_write(client: AsyncClient) -> None:
    await setup_family(client)
    await client.post(
        "/api/documents", json={"title": "Published Guide", "status": "published"}
    )
    await client.post(
        "/api/documents", json={"title": "Draft Guide", "status": "draft"}
    )

    member = await client.post(
        "/api/members",
        json={
            "email": "reader@example.com",
            "password": "supersecret",
            "display_name": "Reader",
            "role": "reader",
        },
    )
    assert member.status_code == 201

    async with new_client() as reader_client:
        login = await reader_client.post(
            "/api/auth/login",
            json={"email": "reader@example.com", "password": "supersecret"},
        )
        assert login.status_code == 200

        docs = await reader_client.get("/api/documents")
        assert [d["title"] for d in docs.json()] == ["Published Guide"]

        draft = await reader_client.get("/api/documents/draft-guide")
        assert draft.status_code == 404

        create = await reader_client.post("/api/documents", json={"title": "Nope"})
        assert create.status_code == 403


@pytest.mark.asyncio
async def test_family_isolation(client: AsyncClient) -> None:
    await setup_family(client, family_name="The Smiths", email="admin@example.com")

    create = await client.post(
        "/api/documents", json={"title": "Smith Doc", "status": "published"}
    )
    smith_slug = create.json()["slug"]

    other_family = Family(name="The Joneses")
    await other_family.insert()
    other_user = User(
        email="jones@example.com",
        password_hash=hash_password("supersecret"),
        display_name="Jones",
        role="editor",
        family_id=other_family.id,
    )
    await other_user.insert()

    async with new_client() as other_client:
        login = await other_client.post(
            "/api/auth/login",
            json={"email": "jones@example.com", "password": "supersecret"},
        )
        assert login.status_code == 200

        docs = await other_client.get("/api/documents")
        assert docs.json() == []

        get_response = await other_client.get(f"/api/documents/{smith_slug}")
        assert get_response.status_code == 404
