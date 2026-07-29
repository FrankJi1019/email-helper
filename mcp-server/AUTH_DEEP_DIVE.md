# Authentication Deep Dive — Email Helper MCP Server

## The Big Picture

There are **three** separate authentication relationships in this project:

```
┌──────────┐   (1) OAuth    ┌────────────┐   (2) M2M Token    ┌─────────────┐
│  Claude  │ ◄────────────► │ MCP Server │ ─────────────────► │ API Gateway │
│  (Client)│                │  (FastMCP) │   + X-Username      │ (JWT Auth)  │
└──────────┘                └─────┬──────┘                    └─────────────┘
                                  │
                           (3) Cognito
                           (Identity Provider)
```

1. **Claude ↔ MCP Server** — OAuth 2.0 authorization code flow (proxied through FastMCP)
2. **MCP Server → API Gateway** — M2M client_credentials token
3. **Both rely on Cognito** — as the identity provider and token issuer

---

## Authentication Relationship #1: Claude ↔ MCP Server

### How OAuth Works Here

The MCP protocol requires OAuth 2.0 for authentication. FastMCP implements an **OAuth proxy** — it sits between the MCP client (Claude) and the real identity provider (Cognito).

#### The Full Flow (step by step):

```
1. Claude connects to https://mcp.email-helper.frankji.com/mcp
2. Server returns 401 — client needs to authenticate
3. Claude checks /.well-known/oauth-authorization-server for endpoints
4. Claude calls POST /register (Dynamic Client Registration)
   → Server creates a local client record, returns client_id
5. Claude opens browser to GET /authorize?response_type=code&client_id=...&redirect_uri=http://localhost:9999/callback
6. MCP Server stores a "transaction" and redirects to Cognito's hosted UI:
   → https://cognito-domain/oauth2/authorize?client_id=MCP_CLIENT_ID&redirect_uri=https://mcp.email-helper.frankji.com/auth/callback&scope=openid
7. User logs in on Cognito's hosted UI
8. Cognito redirects back to: https://mcp.email-helper.frankji.com/auth/callback?code=ABC123
9. MCP Server receives the code and exchanges it with Cognito's token endpoint:
   → POST https://cognito-domain/oauth2/token (with code + client_secret + redirect_uri)
   → Receives: access_token, id_token, refresh_token from Cognito
10. MCP Server stores the Cognito tokens internally (encrypted)
11. MCP Server issues its OWN JWT to Claude (signed by FastMCP's key)
12. MCP Server redirects Claude's browser back to http://localhost:9999/callback?code=XYZ
13. Claude exchanges that code with POST /token on the MCP server
14. Claude receives the FastMCP JWT and uses it for all subsequent requests
```

#### Key Insight: Two Layers of OAuth

| | Client ↔ MCP Server | MCP Server ↔ Cognito |
|---|---|---|
| Who authenticates | Claude (MCP client) | MCP Server (confidential client) |
| Token issued by | FastMCP | Cognito |
| Token type | FastMCP JWT | Cognito access token |
| Redirect URI | `http://localhost:9999/callback` | `https://mcp.email-helper.frankji.com/auth/callback` |
| PKCE | Client → Server (yes) | Server → Cognito (disabled) |

### What the FastMCP JWT Contains

When you call `get_access_token()` inside a tool handler, you get a FastMCP JWT:

```json
{
  "sub": "a92ec448-f011-70b9-15a5-e3be45d34216",
  "iss": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_GZTFEBRiw",
  "client_id": "41hdbqdeb0jcu31f3g4qi5hdca",
  "aud": "http://localhost:8000/mcp",     ← MCP resource URL, NOT a Cognito audience
  "username": "frank",
  "token_use": "access",
  "scope": "openid"
}
```

**This token is NOT a Cognito token.** It looks like one (copies Cognito claims), but:
- It's signed by FastMCP's key (not Cognito's JWKS)
- The `aud` is the MCP resource URL
- API Gateway will reject it because the signature doesn't match Cognito's keys

---

## Authentication Relationship #2: MCP Server → API Gateway

### The Problem

We need to call the backend API on behalf of the user, but:
- We can't forward the FastMCP JWT (wrong signature, wrong audience)
- We can't get the raw Cognito token (FastMCP doesn't expose it to tool handlers)
- The Lambda needs to know WHICH user is making the request

### The Solution: M2M Token + Username Header

```python
# 1. Get an M2M token (cached, refreshes automatically)
token = await get_m2m_token()

# 2. Extract username from FastMCP token claims
username = get_access_token().claims.get("username")

# 3. Call API with M2M token + X-Username header
response = await client.get(
    f"{API_BASE_URL}/schedules",
    headers={
        "Authorization": f"Bearer {token}",
        "X-Username": username,
    },
)
```

### How the M2M Token Works

M2M = Machine-to-Machine. No user involved — just the server authenticating as itself.

```python
async def get_m2m_token() -> str:
    # OAuth 2.0 Client Credentials Grant
    response = await client.post(
        f"{COGNITO_DOMAIN}/oauth2/token",
        headers={
            "Authorization": f"Basic {base64(client_id:client_secret)}",
        },
        data={
            "grant_type": "client_credentials",
            "scope": "default-m2m-resource-server-akote5/read",
        },
    )
    return response.json()["access_token"]
```

**Why this token works with API Gateway:**
- It has a custom scope → Cognito includes an `aud` claim
- The `aud` value = resource server identifier (`default-m2m-resource-server-akote5`)
- This identifier is in the API Gateway authorizer's audience list
- The token is signed by Cognito's keys → signature validation passes

### Lambda-Side Validation

```typescript
function getUsername(event): string | null {
    const claims = event.requestContext.authorizer.jwt.claims

    // Check WHO is calling
    if (claims.client_id === M2M_CLIENT_ID) {
        // It's the MCP server — trust the X-Username header
        return event.headers["x-username"] || null
    }

    // It's a regular user (e.g., from the web app) — read from JWT
    return claims.username || null
}
```

**Security:** Only the M2M client can set user identity via header. A regular user token can't impersonate someone else because the Lambda reads their username from the JWT claims directly.

---

## Authentication Relationship #3: API Gateway JWT Authorizer

### How It Validates Tokens

API Gateway's JWT authorizer checks (in order):
1. **Signature** — verifies against issuer's JWKS (Cognito's public keys)
2. **Issuer** (`iss`) — must match configured issuer URL
3. **Audience** (`aud` or `client_id`) — must match one of the configured audiences
4. **Expiration** (`exp`) — must be in the future

### Cognito Token Types and Their Claims

| Claim | User Access Token (no custom scopes) | User Access Token (with custom scopes) | M2M Token |
|-------|------|------|------|
| `iss` | ✅ Cognito issuer URL | ✅ Cognito issuer URL | ✅ Cognito issuer URL |
| `aud` | ❌ **ABSENT** | ✅ Resource server ID | ✅ Resource server ID |
| `client_id` | ✅ App client ID | ✅ App client ID | ✅ M2M client ID |
| `username` | ✅ User's username | ✅ User's username | ❌ ABSENT |
| `scope` | `openid email profile` | `custom-server/scope` | `custom-server/scope` |

**Critical rule:** API Gateway checks `aud` first. If `aud` is absent, it falls back to `client_id`. When `aud` IS present, it must match one of the authorizer's audience entries.

### Our Authorizer Configuration

```json
{
  "Audience": [
    "41hdbqdeb0jcu31f3g4qi5hdca",         // MCP app client ID (for user tokens without aud)
    "1v4haoe23lut4ssb0hupq78v4r",         // M2M client ID
    "default-m2m-resource-server-akote5",  // Resource server identifier (for M2M tokens with aud)
    "http://localhost:8000/mcp",           // FastMCP resource URL (local dev)
    "https://mcp.email-helper.frankji.com/mcp"  // FastMCP resource URL (prod)
  ],
  "Issuer": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_GZTFEBRiw"
}
```

---

## Problems We Hit & How We Solved Them

### Problem 1: 401 Unauthorized from API Gateway

**Symptom:** `get_schedules` returned `401 {"message":"Unauthorized"}`

**Investigation:**
- Decoded the JWT being sent to API Gateway
- Found it was the FastMCP JWT, not a Cognito token
- FastMCP JWT has `aud: "http://localhost:8000/mcp"` — not in the authorizer's audience list
- Even if we added it, the **signature** is wrong (signed by FastMCP, not Cognito)

**Root cause:** `get_access_token().token` returns the FastMCP proxy JWT, not the raw Cognito token. FastMCP stores the Cognito token internally but doesn't expose it to tool handlers.

**Solution:** Don't forward the user token at all. Use M2M token for all API calls.

### Problem 2: Lambda Needs User Identity

**Symptom:** After switching to M2M token, the Lambda can't identify the user (M2M tokens have no `username` claim).

**Investigation:**
- Checked the Lambda code — it reads `event.requestContext.authorizer.jwt.claims.username`
- M2M tokens don't have this claim (no user is involved in client_credentials flow)

**Solution:** Pass username via `X-Username` header. Lambda checks `client_id` to decide whether to trust the header or read from claims.

### Problem 3: `invalid_grant` Error on EC2

**Symptom:** OAuth login succeeded (user sees Cognito hosted UI, logs in), but token exchange fails with `invalid_grant`.

**Investigation:**
1. Checked callback URLs in Cognito — correct ✅
2. Checked `redirect_uri` in authorize vs token exchange — matched ✅
3. Checked PKCE — disabled forwarding, still failed ✅
4. Checked `resource` parameter — **FOUND IT** ❌

**Root cause:** FastMCP forwards a `resource` parameter (RFC 8707) to Cognito's authorize endpoint:
```
resource=https%3A%2F%2Fmcp.email-helper.frankji.com%2Fmcp
```
Cognito doesn't support RFC 8707. It silently accepts the authorize request but then rejects the token exchange because the code was bound to an unknown resource.

**Fix:** `auth_provider._forward_resource = False`

**Why it worked locally:** Locally, `BASE_URL=http://localhost:8000`. The `resource` parameter was still sent, but Cognito may handle it differently for `localhost` URLs, or the local test was using a different code path. The exact reason it worked locally but not on EC2 isn't fully clear — but disabling it fixes both.

### Problem 4: Test Client `ConnectError`

**Symptom:** `httpx.ConnectError: [Errno -2] Name or service not known`

**Root cause:** Test client was pointing to `http://localhost:8000/mcp` but the MCP server wasn't running locally — it was on EC2.

**Fix:** Changed test client URL to `https://mcp.email-helper.frankji.com/mcp`

### Problem 5: Random OAuth Callback Port

**Symptom:** `invalid_grant` when test client connects to production MCP server.

**Root cause:** FastMCP's test client starts a local HTTP server on a **random port** (e.g., `http://localhost:60139/callback`) to receive the OAuth callback. This URL must be registered in Cognito's allowed callback URLs. A random port can't be pre-registered.

**Fix:** Use fixed port: `OAuth(callback_port=9999)` and register `http://localhost:9999/callback` in Cognito.

### Problem 6: Consent Screen Causing Multiple Redirects

**Symptom:** The `/authorize` endpoint was hit 3 times in logs before reaching Cognito.

**Root cause:** FastMCP's built-in consent screen adds an extra redirect hop. Combined with browser behavior, this caused multiple transactions.

**Fix:** `require_authorization_consent="external"` — skip FastMCP's consent screen since Cognito handles user consent itself.

---

## Mental Model: Token Types Cheat Sheet

| Token | Issued By | Used Where | Contains Username? | Has `aud`? |
|-------|-----------|-----------|-------------------|-----------|
| FastMCP JWT | MCP Server | Claude → MCP Server | Yes (in claims) | Yes (MCP resource URL) |
| Cognito User Token | Cognito | Nowhere (stored internally) | Yes | No (standard scopes only) |
| Cognito M2M Token | Cognito | MCP Server → API Gateway | No | Yes (resource server ID) |

---

## Cognito Concepts Summary

| Concept | What It Is | Our Usage |
|---------|-----------|-----------|
| **User Pool** | User directory + auth service | Stores users, handles login |
| **App Client** | OAuth client registration | We have 2: one for MCP (auth code flow), one for M2M (client_credentials) |
| **Client Secret** | Proves the app client's identity | Required for confidential clients (server-side apps) |
| **Resource Server** | Defines custom scopes/APIs | `default-m2m-resource-server-akote5` with scope `read` |
| **Custom Scope** | Permission beyond OIDC standards | Triggers `aud` claim in access tokens |
| **Hosted UI** | Cognito's built-in login page | Users log in here during OAuth flow |
| **Callback URL** | Where Cognito redirects after login | Must be pre-registered, must match exactly |

---

## OAuth Grant Types Used

### 1. Authorization Code (User Login)

```
Client → MCP Server → Cognito
Purpose: Authenticate a human user
Result: MCP server gets Cognito tokens, issues its own JWT to client
```

Used when: Claude needs to act on behalf of a user.

### 2. Client Credentials (M2M)

```
MCP Server → Cognito
Purpose: Server authenticates as itself (no user)
Result: Access token with custom scopes
```

Used when: MCP server calls backend API on behalf of user (but authenticates as a service).

---

## Security Considerations

1. **M2M secret protection** — The M2M client_secret is in `.env` on the EC2 instance. If compromised, an attacker could call the API as any user by setting `X-Username`.

2. **X-Username trust** — Only trusted when `client_id` matches the M2M client. A regular user can't set this header to impersonate someone else.

3. **Token caching** — M2M tokens are cached for `expires_in - 60` seconds. This prevents unnecessary token requests but means revocation takes up to a minute to take effect.

4. **HTTPS requirement** — The MCP server MUST be behind HTTPS in production. OAuth tokens are bearer tokens — if intercepted over HTTP, they can be reused.

5. **Spot instance risk** — If the instance is interrupted, the server goes down. The systemd service auto-restarts when the instance comes back, but there's brief downtime.
