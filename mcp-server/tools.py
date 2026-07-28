"""MCP tool definitions for the email-helper server."""

import httpx
from fastmcp import FastMCP
from fastmcp.server.dependencies import get_access_token

from api_client import api_get, api_post, api_delete


def _get_username() -> str:
    """Extract the username from the current user's access token claims."""
    token = get_access_token()
    if not token or not token.claims:
        raise RuntimeError("No authenticated user")
    username = token.claims.get("username")
    if not username:
        raise RuntimeError("Username not found in token claims")
    return username


def register_tools(mcp: FastMCP) -> None:
    """Register all MCP tools on the given server instance."""

    @mcp.tool(name="get_schedules")
    async def get_schedules():
        """Retrieve all scheduled emails for the authenticated user."""
        try:
            username = _get_username()
            return await api_get("/schedules", username=username)
        except httpx.HTTPStatusError as e:
            return {"error": f"API request failed: {e.response.status_code} {e.response.text}"}
        except Exception as e:
            return {"error": f"Failed to call API: {str(e)}"}

    @mcp.tool(name="create_schedule")
    async def create_schedule(
        subject: str, body: str, send_at: str, timezone: str, to_email: str
    ):
        """Create a new scheduled email.

        Args:
            subject: Email subject line.
            body: Email body content.
            send_at: When to send the email in ISO 8601 datetime format without offset (e.g. "2026-08-01T09:00:00").
            timezone: IANA timezone string (e.g. "Pacific/Auckland", "America/New_York").
            to_email: Recipient email address.
        """
        try:
            username = _get_username()
            payload = {
                "subject": subject,
                "body": body,
                "sendAt": send_at,
                "timezone": timezone,
                "toEmail": to_email,
            }
            response = await api_post("/schedules", username=username, payload=payload)
            return {"status": "created", "statusCode": response.status_code}
        except httpx.HTTPStatusError as e:
            return {"error": f"API request failed: {e.response.status_code} {e.response.text}"}
        except Exception as e:
            return {"error": f"Failed to call API: {str(e)}"}

    @mcp.tool(name="delete_schedule")
    async def delete_schedule(schedule_id: str):
        """Delete a scheduled email by its ID.

        Args:
            schedule_id: The unique ID of the schedule to delete.
        """
        try:
            response = await api_delete(f"/schedules/{schedule_id}")
            return {"status": "deleted", "statusCode": response.status_code}
        except httpx.HTTPStatusError as e:
            return {"error": f"API request failed: {e.response.status_code} {e.response.text}"}
        except Exception as e:
            return {"error": f"Failed to call API: {str(e)}"}
