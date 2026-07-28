import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda"
import {
    DynamoDBDocumentClient,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DYNAMODB_TABLE_NAME = "scheduled-emails" as const
const M2M_CLIENT_ID = "1v4haoe23lut4ssb0hupq78v4r" as const

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())

function getUsername(event: APIGatewayProxyEventV2WithJWTAuthorizer): string | null {
    const claims = event.requestContext.authorizer.jwt.claims
    const tokenClientId = claims.client_id as string | undefined

    // M2M token: trust the X-Username header
    if (tokenClientId === M2M_CLIENT_ID) {
        return event.headers["x-username"] || null
    }

    // User token: extract from JWT claims
    const username = claims.username
    return typeof username === "string" ? username : null
}

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {

    const username = getUsername(event)

    if (!username) {
        return {
            statusCode: 401,
            body: JSON.stringify({error: "invalid token or missing username"})
        }
    }

    const result = await dynamodb.send(
        new ScanCommand({
            TableName: DYNAMODB_TABLE_NAME,
            FilterExpression: "#username = :username",
            ExpressionAttributeNames: {
                "#username": "username"
            },
            ExpressionAttributeValues: {
                ":username": username
            }
        })
    )

    return result
}
