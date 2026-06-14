import pytest
from httpx import AsyncClient

from tests.helpers import setup_family


@pytest.mark.asyncio
async def test_setup_status_initially_needed(client: AsyncClient) -> None:
    response = await client.get("/api/setup/status")
    assert response.status_code == 200
    assert response.json() == {"needs_setup": True}


@pytest.mark.asyncio
async def test_setup_creates_family_and_admin(client: AsyncClient) -> None:
    response = await client.post(
        "/api/setup",
        json={
            "family_name": "The Smiths",
            "email": "admin@example.com",
            "password": "supersecret",
            "display_name": "Admin",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "admin@example.com"
    assert body["role"] == "editor"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

    status_response = await client.get("/api/setup/status")
    assert status_response.json() == {"needs_setup": False}


@pytest.mark.asyncio
async def test_setup_fails_when_already_done(client: AsyncClient) -> None:
    await setup_family(client)

    second = await client.post(
        "/api/setup",
        json={
            "family_name": "The Smiths",
            "email": "admin@example.com",
            "password": "supersecret",
            "display_name": "Admin",
        },
    )
    assert second.status_code == 409


@pytest.mark.asyncio
async def test_login_logout_and_me(client: AsyncClient) -> None:
    await setup_family(client)

    login_response = await client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "supersecret"},
    )
    assert login_response.status_code == 200

    me_response = await client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@example.com"

    logout_response = await client.post("/api/auth/logout")
    assert logout_response.status_code == 200

    me_after_logout = await client.get("/api/auth/me")
    assert me_after_logout.status_code == 401


@pytest.mark.asyncio
async def test_login_rejects_wrong_password(client: AsyncClient) -> None:
    await setup_family(client)

    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotates_tokens(client: AsyncClient) -> None:
    await setup_family(client)

    refresh_response = await client.post("/api/auth/refresh")
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.cookies


@pytest.mark.asyncio
async def test_require_editor_blocks_readers(client: AsyncClient) -> None:
    from app.auth.security import hash_password
    from app.models.family import Family
    from app.models.user import User

    family = Family(name="The Smiths")
    await family.insert()

    reader = User(
        email="reader@example.com",
        password_hash=hash_password("supersecret"),
        display_name="Reader",
        role="reader",
        family_id=family.id,
    )
    await reader.insert()

    await client.post(
        "/api/auth/login",
        json={"email": "reader@example.com", "password": "supersecret"},
    )

    me_response = await client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["role"] == "reader"
