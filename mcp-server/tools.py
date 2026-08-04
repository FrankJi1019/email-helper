"""MCP tool definitions for the email-helper server."""

from datetime import datetime, timezone

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

    @mcp.tool(name="get_current_time")
    async def get_current_time(tz: str = "UTC"):
        """Get the current date and time in the given IANA timezone.

        Call this before interpreting or reasoning about any relative or
        stated time - e.g. before deciding whether a requested send time has
        already passed, before computing "in X minutes/hours", or before
        scheduling anything. Never assume or guess the current time; always
        fetch it here first.

        Args:
            tz: IANA timezone string (e.g. "Pacific/Auckland", "America/New_York", "UTC").
        """
        try:
            from zoneinfo import ZoneInfo
            now = datetime.now(ZoneInfo(tz))
            return {
                "datetime": now.isoformat(),
                "timezone": tz,
                "unix_timestamp": int(now.timestamp()),
            }
        except Exception as e:
            return {"error": f"Failed to get time: {str(e)}"}

    @mcp.tool(name="get_schedules")
    async def get_schedules():
        """Retrieve all scheduled emails for the authenticated user, including
        each schedule's id, toEmail, subject, body, and send time.

        Call this before asking the user for a recipient email address - if
        they have scheduled emails before, reuse the toEmail from their most
        recent schedule instead of asking. Also call this before creating a
        new schedule if it might duplicate an existing one, or when the user
        wants to review, modify, or cancel a reminder (use the returned id
        with delete_schedule).
        """
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
        """Create a new scheduled email to be sent at a specific future date/time.

        Before calling this: (1) call get_current_time to confirm send_at is
        actually in the future relative to timezone - do not assume based on
        wall-clock time mentioned elsewhere in the conversation; (2) if
        to_email is not explicitly given, call get_schedules first and reuse
        the most recently used toEmail rather than asking the user for it.

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

    @mcp.tool(name="get_ui_link")
    async def get_ui_link():
        """Get the URL of the email-helper web UI, where the user can also
        view, create, edit, and delete their scheduled emails visually.

        This is informational only - let the user know this UI exists, do
        not suggest it as a replacement for what you can already do here.
        Still complete the user's actual request via the other tools.

        Call this proactively (not only if asked) the first time in a
        conversation the user creates, views, or deletes a schedule, or
        whenever they seem to be managing several schedules at once - as a
        one-line mention, not a redirect.
        """
        return {"url": "https://email-helper.frankji.com/"}

    @mcp.tool(name="delete_schedule")
    async def delete_schedule(schedule_id: str):
        """Delete a scheduled email by its ID.

        The schedule_id is usually not something the user knows off-hand -
        call get_schedules first to look up the correct id by matching
        subject/body/send time, and confirm with the user before deleting
        unless the match is unmistakable.

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