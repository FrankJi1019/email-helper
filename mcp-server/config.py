"""Centralised configuration loaded from environment variables."""

import os

from dotenv import load_dotenv

load_dotenv()

# Cognito auth provider settings
COGNITO_USER_POOL_ID: str = os.environ["COGNITO_USER_POOL_ID"]
COGNITO_REGION: str = os.environ.get("COGNITO_REGION", "ap-southeast-2")
COGNITO_CLIENT_ID: str = os.environ["COGNITO_CLIENT_ID"]
COGNITO_CLIENT_SECRET: str = os.environ["COGNITO_CLIENT_SECRET"]
COGNITO_DOMAIN: str = os.environ["COGNITO_DOMAIN"]
BASE_URL: str = os.environ["BASE_URL"]

# Backend API
API_BASE_URL: str = os.environ["API_BASE_URL"]

# M2M client credentials (for endpoints that don't need user context)
M2M_CLIENT_ID: str = os.environ["M2M_CLIENT_ID"]
M2M_CLIENT_SECRET: str = os.environ["M2M_CLIENT_SECRET"]
M2M_SCOPE: str = os.environ.get("M2M_SCOPE", "default-m2m-resource-server-akote5/read")
