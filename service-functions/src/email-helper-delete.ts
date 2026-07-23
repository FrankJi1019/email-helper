import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    SchedulerClient,
    DeleteScheduleCommand,
    ResourceNotFoundException,
} from "@aws-sdk/client-scheduler";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())
const scheduler = new SchedulerClient()

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
    } catch (e: unknown) {
        if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Item with id ${id} not found` })
            }
        }
        console.error(e)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Unable to delete item: ${id}` })
        }
    }

    try {
        await scheduler.send(new DeleteScheduleCommand({
            Name: `email-helper-${id}`,
        }))
    } catch (e: unknown) {
        if (e instanceof ResourceNotFoundException) {
        } else {
            console.error(`Failed to delete schedule for id ${id}`, e)
            return {
                statusCode: 500,
                body: JSON.stringify({ message: `Item deleted but failed to remove schedule for id: ${id}` })
            }
        }
    }

    return { statusCode: 204 }
}