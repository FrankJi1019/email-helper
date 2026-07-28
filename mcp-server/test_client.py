from fastmcp import Client
from fastmcp.client.auth import OAuth
import asyncio


async def main():
    oauth = OAuth(callback_port=9999)
    async with Client("https://mcp.email-helper.frankji.com/mcp", auth=oauth) as client:
        tools = await client.list_tools()
        print("Available tools:", [t.name for t in tools])

        print("\n--- Calling get_schedules ---")
        result = await client.call_tool("get_schedules")
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
