"""Email-helper MCP server entrypoint."""

from fastmcp import FastMCP
from fastmcp.server.auth.providers.aws import AWSCognitoProvider

from config import (
    BASE_URL,
    COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET,
    COGNITO_REGION,
    COGNITO_USER_POOL_ID,
)
from tools import register_tools

auth_provider = AWSCognitoProvider(
    user_pool_id=COGNITO_USER_POOL_ID,
    aws_region=COGNITO_REGION,
    client_id=COGNITO_CLIENT_ID,
    client_secret=COGNITO_CLIENT_SECRET,
    base_url=BASE_URL,
    require_authorization_consent="external",
)

mcp = FastMCP(name="EmailHelperMCP", auth=auth_provider)

# Disable PKCE and resource forwarding to Cognito — these cause
# invalid_grant errors with Cognito's hosted UI.
auth_provider._forward_pkce = False
auth_provider._forward_resource = False

register_tools(mcp)

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
