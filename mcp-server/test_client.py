from fastmcp import Client
import asyncio


async def main():
    async with Client("http://localhost:8000/mcp", auth="oauth") as client:
        tools = await client.list_tools()
        print("Available tools:", [t.name for t in tools])

        print("\n--- Calling get_schedules ---")
        result = await client.call_tool("get_schedules")
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
