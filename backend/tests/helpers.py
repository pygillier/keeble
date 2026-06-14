from httpx import AsyncClient


async def setup_family(
    client: AsyncClient,
    family_name: str = "The Smiths",
    email: str = "admin@example.com",
    password: str = "supersecret",
    display_name: str = "Admin",
) -> dict:
    response = await client.post(
        "/api/setup",
        json={
            "family_name": family_name,
            "email": email,
            "password": password,
            "display_name": display_name,
        },
    )
    assert response.status_code == 200
    return response.json()
