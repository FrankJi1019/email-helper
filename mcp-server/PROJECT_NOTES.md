# Email Helper MCP Server — Project Documentation

## Project Overview

An MCP (Model Context Protocol) server that allows AI assistants like Claude to manage scheduled emails on behalf of authenticated users. The server connects Claude (or any MCP client) to a backend API (AWS API Gateway + Lambda + DynamoDB) via OAuth-secured tool calls.

**Live URL**: `https://mcp.email-helper.frankji.com/mcp`

---

## Architecture

```
┌─────────────┐     OAuth      ┌──────────────────┐    M2M Token    ┌─────────────────┐
│  Claude.ai  │ ◄────────────► │  MCP Server (EC2) │ ──────────────► │  API Gateway     │
│  (MCP Client)│   Streamable   │  FastMCP + Cognito │  + X-Username   │  (JWT Authorizer)│
└─────────────┘     HTTP        └──────────────────┘    Header        └────────┬────────┘
                                                                                │
                                        ┌───────────────────────────────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   Lambda Functions  │
                              │  - get-all          │
                              │  - create           │
                              │  - delete           │
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼─────────┐
                              │     DynamoDB       │
                              │  scheduled-emails  │
                              └───────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| MCP Framework | FastMCP (Python) |
| Auth Provider | AWS Cognito (OAuth 2.0 / OIDC) |
| Backend API | AWS API Gateway (HTTP API) + JWT Authorizer |
| Compute (API) | AWS Lambda (Node.js 22) |
| Database | DynamoDB |
| Scheduling | AWS EventBridge Scheduler |
| Hosting (MCP) | EC2 (t3.micro spot instance) |
| Reverse Proxy | Nginx + Certbot (Let's Encrypt) |
| Package Manager | uv (Python), yarn (Node.js) |

---

## Project Structure

```
mcp-server/
├── main.py          # Entrypoint — wires auth, creates FastMCP, registers tools
├── config.py        # Centralised env var loading
├── auth.py          # M2M token caching (client_credentials flow)
├── api_client.py    # HTTP helpers for calling backend API
├── tools.py         # MCP tool definitions (get/create/delete schedules)
├── test_client.py   # Test client for OAuth flow testing
├── pyproject.toml   # Dependencies (fastmcp, httpx, python-dotenv)
├── uv.lock          # Locked dependencies
├── .env             # Secrets (not committed)
└── .gitignore
```

---

## How the MCP Server Works

### 1. Server Initialisation (`main.py`)

```python
from fastmcp import FastMCP
from fastmcp.server.auth.providers.aws import AWSCognitoProvider

auth_provider = AWSCognitoProvider(
    user_pool_id=COGNITO_USER_POOL_ID,
    aws_region=COGNITO_REGION,
    client_id=COGNITO_CLIENT_ID,
    client_secret=COGNITO_CLIENT_SECRET,
    base_url=BASE_URL,
    require_authorization_consent="external",
)

mcp = FastMCP(name="EmailHelperMCP", auth=auth_provider)

# Critical: Cognito doesn't support RFC 8707 resource indicators
auth_provider._forward_pkce = False
auth_provider._forward_resource = False
```

**Key learnings:**
- `AWSCognitoProvider` is an OIDC proxy — it handles OAuth for MCP clients, then issues its own JWT internally
- `require_authorization_consent="external"` skips the built-in consent screen (Cognito handles consent)
- `_forward_pkce = False` — don't forward PKCE challenges to Cognito (causes issues with confidential clients)
- `_forward_resource = False` — **CRITICAL** — Cognito rejects requests with the `resource` parameter (RFC 8707), causing `invalid_grant` errors

### 2. Tool Registration (`tools.py`)

Tools are registered via a `register_tools(mcp)` function:

```python
@mcp.tool(name="get_schedules")
async def get_schedules():
    """Retrieve all scheduled emails for the authenticated user."""
    username = _get_username()  # Extract from FastMCP token claims
    return await api_get("/schedules", username=username)
```

Each tool:
1. Extracts `username` from the authenticated user's token claims
2. Calls the backend API using the M2M token (not the user's token)
3. Passes `username` via `X-Username` header

### 3. Authentication Flow

```
Client (Claude) ──► MCP Server ──► Cognito (login page)
                                         │
Client ◄── redirect with code ◄──────────┘
                                         │
MCP Server exchanges code ──────────────►│
MCP Server receives Cognito tokens ◄─────┘
MCP Server issues its own JWT to client
```

**Why the MCP server issues its own JWT:**
- FastMCP acts as an OAuth proxy between the MCP client and Cognito
- The client gets a FastMCP JWT (not a raw Cognito token)
- This JWT contains Cognito claims (sub, username, etc.) but is signed by FastMCP

### 4. API Authentication Pattern

**Problem:** The FastMCP JWT can't be forwarded to API Gateway because:
- It's signed by FastMCP's key, not Cognito's
- API Gateway validates JWT signatures against Cognito's JWKS
- The `aud` claim is the MCP resource URL, not a Cognito client ID

**Solution:** M2M (Machine-to-Machine) token + username header:

```python
async def api_get(path: str, *, username: str) -> dict:
    token = await get_m2m_token()  # Client credentials flow
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}{path}",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Username": username,
            },
        )
```

The M2M token:
- Is obtained via OAuth client_credentials grant against Cognito
- Has a custom scope (`default-m2m-resource-server-akote5/read`)
- Includes an `aud` claim (resource server identifier)
- Is cached with 60-second buffer before expiry

### 5. Lambda Integration

Lambdas check the token's `client_id` to determine how to extract the username:

```typescript
function getUsername(event: APIGatewayProxyEventV2WithJWTAuthorizer): string | null {
    const claims = event.requestContext.authorizer.jwt.claims
    const tokenClientId = claims.client_id as string | undefined

    // M2M token: trust the X-Username header
    if (tokenClientId === M2M_CLIENT_ID) {
        return event.headers["x-username"] || null
    }

    // User token (e.g., from web app): extract from JWT claims
    return typeof claims.username === "string" ? claims.username : null
}
```

This means:
- The web frontend still works (sends user token directly, Lambda reads claims)
- The MCP server works (sends M2M token + X-Username header)
- Security: only the M2M client can impersonate users via the header

---

## AWS Infrastructure Details

### Cognito User Pool

- **User Pool ID**: `ap-southeast-2_GZTFEBRiw`
- **App Client (MCP)**: `41hdbqdeb0jcu31f3g4qi5hdca` — authorization code flow, confidential client
- **App Client (M2M)**: `1v4haoe23lut4ssb0hupq78v4r` — client_credentials flow
- **Resource Server**: `default-m2m-resource-server-akote5` with scope `read`
- **Callback URLs**: `http://localhost:8000/auth/callback`, `http://localhost:9999/callback`, `https://mcp.email-helper.frankji.com/auth/callback`

### API Gateway

- **Type**: HTTP API with JWT Authorizer
- **Authorizer audience**: includes client IDs, M2M resource server identifier, and MCP resource URLs
- **Issuer**: `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_GZTFEBRiw`
- API Gateway's JWT authorizer checks `aud` first; if absent, checks `client_id`

### EC2 Deployment

- **Instance**: t3.micro spot (~$2-3/month)
- **Elastic IP**: 54.66.3.52
- **DNS**: A record `mcp.email-helper.frankji.com` → 54.66.3.52
- **Nginx**: reverse proxy on port 443 → localhost:8000
- **Certbot**: auto-renewing Let's Encrypt certificate
- **Systemd**: `mcp-server.service` with auto-restart

---

## Key Debugging Lessons

### 1. `invalid_grant` from Cognito

**Root cause:** FastMCP forwards a `resource` parameter (RFC 8707) to Cognito's authorize endpoint. Cognito doesn't support this and silently fails during token exchange.

**Fix:** `auth_provider._forward_resource = False`

### 2. FastMCP issues its own JWT

The token from `get_access_token().token` inside a tool handler is a **FastMCP JWT**, not the raw Cognito token. It contains Cognito claims (username, sub) in `get_access_token().claims`, but the JWT itself is signed by FastMCP and has `aud` set to the MCP resource URL.

**Implication:** You cannot forward this token to API Gateway. Use M2M token instead.

### 3. API Gateway audience validation

- Cognito **access tokens** (with only standard OIDC scopes) do NOT have an `aud` claim — they use `client_id`
- API Gateway checks `aud` first; only checks `client_id` if `aud` is absent
- M2M tokens (with custom scopes) DO have an `aud` claim set to the resource server identifier

### 4. PKCE with confidential clients

Forwarding PKCE to Cognito from a proxy that uses its own code_verifier can cause mismatches. Disabling PKCE forwarding is safe for confidential clients since the client_secret already proves identity.

### 5. OAuth callback port

The FastMCP test client starts a local HTTP server on a random port to receive the OAuth callback. You must either:
- Use `OAuth(callback_port=9999)` to fix the port
- Register that callback URL in Cognito (`http://localhost:9999/callback`)

---

## How to Create an MCP Server from Scratch

### Step 1: Set up the project

```bash
mkdir my-mcp-server && cd my-mcp-server
uv init
uv add fastmcp httpx python-dotenv
```

### Step 2: Create a basic server

```python
from fastmcp import FastMCP

mcp = FastMCP(name="MyServer")

@mcp.tool(name="hello")
async def hello(name: str):
    """Say hello."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

### Step 3: Add OAuth (Cognito)

```python
from fastmcp.server.auth.providers.aws import AWSCognitoProvider

auth_provider = AWSCognitoProvider(
    user_pool_id="your-pool-id",
    aws_region="ap-southeast-2",
    client_id="your-client-id",
    client_secret="your-client-secret",
    base_url="https://your-domain.com",
    require_authorization_consent="external",
)

mcp = FastMCP(name="MyServer", auth=auth_provider)
auth_provider._forward_pkce = False
auth_provider._forward_resource = False
```

### Step 4: Access user identity in tools

```python
from fastmcp.server.dependencies import get_access_token

@mcp.tool(name="whoami")
async def whoami():
    token = get_access_token()
    return {"username": token.claims.get("username")}
```

### Step 5: Deploy

1. EC2 instance (or any server)
2. Nginx reverse proxy with HTTPS (Certbot)
3. Systemd service for auto-restart
4. DNS A record pointing to server IP

### Step 6: Connect to Claude

Settings → Connectors → Add connector → Remote → Enter your MCP URL

---

## Environment Variables (.env)

```
COGNITO_USER_POOL_ID=ap-southeast-2_GZTFEBRiw
COGNITO_REGION=ap-southeast-2
COGNITO_CLIENT_ID=<mcp app client id>
COGNITO_CLIENT_SECRET=<mcp app client secret>
COGNITO_DOMAIN=https://<domain>.auth.ap-southeast-2.amazoncognito.com
BASE_URL=https://mcp.email-helper.frankji.com  # or http://localhost:8000 for dev
API_BASE_URL=https://<api-id>.execute-api.ap-southeast-2.amazonaws.com
M2M_CLIENT_ID=<m2m app client id>
M2M_CLIENT_SECRET=<m2m app client secret>
M2M_SCOPE=<resource-server-identifier>/<scope-name>
```

---

## Commands Reference

### Local development
```bash
uv run main.py                    # Start MCP server
uv run test_client.py             # Test OAuth + tool calls
```

### EC2 deployment
```bash
sudo systemctl start mcp-server   # Start
sudo systemctl restart mcp-server # Restart after code changes
sudo systemctl status mcp-server  # Check status
sudo journalctl -u mcp-server --since "5 min ago" --no-pager  # View logs
cd ~/email-helper && git pull      # Pull latest code
```

### Lambda deployment
```bash
cd service-functions
yarn run build:getall && yarn run deploy:getall
yarn run build:create && yarn run deploy:create
yarn run build:delete && yarn run deploy:delete
```

---

## Interview Talking Points

1. **Why MCP?** — Standard protocol for AI-tool integration. Allows any MCP-compatible AI (Claude, ChatGPT, etc.) to use your tools without custom integrations per AI provider.

2. **OAuth proxy pattern** — FastMCP acts as an OAuth proxy between the MCP client and Cognito. This lets any MCP client authenticate without knowing about Cognito specifically.

3. **M2M token pattern** — Solved the "proxy JWT can't be forwarded" problem by using service-to-service authentication with user identity passed out-of-band (header).

4. **Security model** — Only the M2M client ID can trigger header-based user identification. Web app users still authenticate directly. Principle of least privilege.

5. **Infrastructure choices** — Spot instance for cost ($2-3/month vs $10/month on-demand). Elastic IP for DNS stability. Systemd for reliability. Nginx for TLS termination.

6. **Debugging approach** — Decoded JWTs to inspect claims, traced the OAuth flow through proxy logs, identified Cognito's RFC 8707 incompatibility through elimination.
