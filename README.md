# Email Helper

A full-stack application for scheduling emails, with AI integration via MCP (Model Context Protocol). Users can schedule emails through a web interface or by chatting with Claude.

## Features

- **Schedule emails** — set subject, body, recipient, date/time, and timezone
- **View & manage schedules** — see all pending/sent/failed emails, delete unwanted ones
- **AI-powered scheduling** — connect Claude (or any MCP client) to create and manage scheduled emails via natural language
- **Secure authentication** — Cognito-based OAuth for both web and MCP access

## Architecture

```
┌────────────────┐        ┌────────────────────────┐        ┌──────────────────┐
│   Web UI       │        │   API Gateway (HTTP)   │        │   MCP Server     │
│   React + Vite │───────►│   JWT Authorizer       │◄───────│   FastMCP        │
│   Amplify Auth │        └───┬────┬────┬──────────┘        │   (EC2)          │
└────────────────┘            │    │    │                   └──────────────────┘
                              │    │    │
        ┌─────────────────────┘    │    └──────────────────────┐
        │ GET /schedules           │ POST /schedules           │ DELETE /schedules/{id}
        ▼                          ▼                           ▼
┌──────────────────┐    ┌──────────────────┐       ┌──────────────────┐
│   λ get-all      │    │   λ create       │       │   λ delete       │
│                  │    │                  │       │                  │
│ Scan DynamoDB    │    │ Write DynamoDB + │       │ Delete DynamoDB  │
│ by username      │    │ Create schedule  │       │ + Remove rule    │
└────────┬─────────┘    └───┬──────────┬───┘       └───┬──────────┬───┘
         │                  │          │               │          │
         ▼                  ▼          ▼               ▼          ▼
    ┌──────────┐      ┌──────────┐ ┌─────────────┐ ┌──────────┐ ┌─────────────┐
    │ DynamoDB │      │ DynamoDB │ │ EventBridge │ │ DynamoDB │ │ EventBridge │
    └──────────┘      └──────────┘ │ Scheduler   │ └──────────┘ │ Scheduler   │
                                   └──────┬──────┘              └─────────────┘
                                          │
                                          │ (at scheduled time)
                                          ▼
                                ┌──────────────────┐
                                │   λ dispatch     │
                                │                  │
                                │ Send email via   │
                                │ SES + update     │
                                │ status           │
                                └───┬──────────┬───┘
                                    │          │
                                    ▼          ▼
                              ┌──────────┐  ┌─────┐
                              │ DynamoDB │  │ SES │
                              └──────────┘  └─────┘
```

## Project Structure

```
email-helper/
├── web/                    # React frontend
├── service-functions/      # Lambda functions (backend)
└── mcp-server/             # MCP server for AI integration
```

---

## Web UI (`/web`)

A React SPA for managing scheduled emails.

**Tech:** React 19, Vite, TypeScript, TailwindCSS, React Query, AWS Amplify (auth), Axios, React Router

**Key features:**
- Cognito-hosted UI login (email + password)
- Create scheduled emails with timezone support
- View all scheduled emails with status (Pending / Dispatched / Failed)
- Delete scheduled emails

---

## Service Functions (`/service-functions`)

Serverless backend — four Lambda functions behind API Gateway.

**Tech:** Node.js 22, TypeScript, esbuild, AWS SDK v3, Zod

| Function | Trigger | Description |
|----------|---------|-------------|
| `email-helper-get-all` | `GET /schedules` | Returns all scheduled emails for the authenticated user |
| `email-helper-create` | `POST /schedules` | Creates a scheduled email + EventBridge schedule |
| `email-helper-delete` | `DELETE /schedules/{id}` | Deletes email from DynamoDB + removes EventBridge schedule |
| `email-helper-dispatch` | EventBridge (at scheduled time) | Sends the email via SES, updates status to DISPATCHED/FAILED |

**How scheduling works:**
1. User creates a schedule → Lambda stores it in DynamoDB + creates an EventBridge Scheduler rule
2. At the scheduled time → EventBridge invokes the dispatch Lambda
3. Dispatch Lambda reads email details from DynamoDB, sends via SES, updates status

---

## MCP Server (`/mcp-server`)

Enables AI assistants (Claude, etc.) to manage scheduled emails via the Model Context Protocol.

**Tech:** Python 3.12, FastMCP, httpx, AWS Cognito OAuth

**Available tools:**
| Tool | Description |
|------|-------------|
| `get_current_time` | Get current date/time in any timezone |
| `get_schedules` | List all scheduled emails for the user |
| `create_schedule` | Schedule a new email |
| `delete_schedule` | Delete a scheduled email by ID |

**Connect to Claude:** Settings → Connectors → Add → Remote → URL: `https://mcp.email-helper.frankji.com/mcp`

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| **Cognito** | User authentication (OAuth 2.0) |
| **API Gateway** | HTTP API with JWT authorizer |
| **Lambda** | Serverless compute for API handlers |
| **DynamoDB** | Email schedule storage |
| **EventBridge Scheduler** | Time-based email dispatch triggers |
| **SES** | Email delivery |
| **EC2** | MCP server hosting |
| **Route 53** | DNS management |
| **CloudFront** | Web UI hosting (CDN) |

---

## Authentication

Two access paths, both secured by Cognito:

1. **Web UI** → Amplify Auth → API Gateway (user's access token directly)
2. **MCP Server** → FastMCP OAuth proxy → API Gateway (M2M token + X-Username header)

The MCP server uses a machine-to-machine token pattern because FastMCP issues its own JWT (which API Gateway can't verify). User identity is passed via a trusted header, validated by the Lambda.
