import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda"
import {
    DynamoDBDocumentClient,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DYNAMODB_TABLE_NAME = "scheduled-emails" as const

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {

    const username = event.requestContext.authorizer.jwt.claims.username

    if (!username || typeof username !== "string") {
        return {
            statusCode: 401,
            body: JSON.stringify({error: "invalid token"})
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
                ":username": username as string
            }
        })
    )

    return result
}