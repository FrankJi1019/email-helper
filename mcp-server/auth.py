"""M2M (machine-to-machine) token management using client credentials flow."""

import base64
import time

import httpx

from config import COGNITO_DOMAIN, M2M_CLIENT_ID, M2M_CLIENT_SECRET, M2M_SCOPE

_token_cache: dict = {"token": None, "expires_at": 0}


async def get_m2m_token() -> str:
    """Get a cached M2M access token, refreshing via client credentials if expired."""
    if _token_cache["token"] and time.time() < _token_cache["expires_at"]:
        return _token_cache["token"]

    credentials = base64.b64encode(
        f"{M2M_CLIENT_ID}:{M2M_CLIENT_SECRET}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{COGNITO_DOMAIN}/oauth2/token",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {credentials}",
            },
            data={
                "grant_type": "client_credentials",
                "scope": M2M_SCOPE,
            },
        )
        response.raise_for_status()
        data = response.json()

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + data.get("expires_in", 3600) - 60
    return data["access_token"]
