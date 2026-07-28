"""HTTP client helpers for the email-helper backend API."""

from typing import Any

import httpx

from config import API_BASE_URL
from auth import get_m2m_token


async def api_get(path: str, *, username: str) -> dict[str, Any]:
    """Make an M2M-authenticated GET request, passing username via header."""
    token = await get_m2m_token()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}{path}",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Username": username,
            },
        )
        response.raise_for_status()
        return response.json()


async def api_post(path: str, *, username: str, payload: dict[str, Any]) -> httpx.Response:
    """Make an M2M-authenticated POST request, passing username via header."""
    token = await get_m2m_token()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE_URL}{path}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "X-Username": username,
            },
            json=payload,
        )
        response.raise_for_status()
        return response


async def api_delete(path: str) -> httpx.Response:
    """Make an M2M-authenticated DELETE request (no user context needed)."""
    token = await get_m2m_token()
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{API_BASE_URL}{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()
        return response
