import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())

const DYNAMODB_TABLE_NAME = "scheduled-emails" as const

export const handler = async (event: APIGatewayProxyEventV2) => {
    const id = event.pathParameters?.id

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required path parameter: id" })
        }
    }

    try {
        const res = await dynamodb.send(new DeleteCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: { id },
            ConditionExpression: "attribute_exists(id)"
        }))
        return res
    } catch (e: unknown) {
        if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Item with id ${id} not found` })
            }
        }
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Unable to delete item: ${id}` })
        }
    }
}