import { type APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import {
    DynamoDBDocumentClient,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler"
import { randomUUID } from "crypto";
import { z } from 'zod'

const DYNAMODB_TABLE_NAME = "scheduled-emails" as const
const DISPATCH_EMAIL_LAMBDA_ARN = "arn:aws:lambda:ap-southeast-2:218448085940:function:email-helper-dispatch"
const DISPATCH_EMAIL_ROLE_ARN = "arn:aws:iam::218448085940:role/email-helper-dispatch-lambda-role"

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())
const scheduler = new SchedulerClient()

const PayloadSchema = z.object({
    subject: z.string().min(1),
    body: z.string(),
    sendAt: z.iso.datetime({ offset: false, local: true }),
    timezone: z.string(),
    toEmail: z.email()
})

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {

    const parsedPayload = PayloadSchema.safeParse(JSON.parse(event.body ?? "{}"))

    if (!parsedPayload.success) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: z.treeifyError(parsedPayload.error)})
        }
    }

    const { subject, body, sendAt, timezone, toEmail } = parsedPayload.data
    const username = event.requestContext.authorizer.jwt.claims.username

    const id = randomUUID()

    const createDynamodbPromise = dynamodb.send(new PutCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Item: {
            id, 
            username,
            subject, 
            body, 
            sendAt, 
            timezone, 
            toEmail, 
            status: "PENDING", 
            createdAt: new Date().toISOString()
        }
    }))

    const createSchedulePromise = scheduler.send(new CreateScheduleCommand({
        Name: `email-helper-${id}`,
        ScheduleExpression: `at(${sendAt})`,
        ScheduleExpressionTimezone: timezone,
        FlexibleTimeWindow: { Mode: "OFF" },
        ActionAfterCompletion: "DELETE",
        Target: {
            Arn: DISPATCH_EMAIL_LAMBDA_ARN,
            RoleArn: DISPATCH_EMAIL_ROLE_ARN,
            Input: JSON.stringify({
                id
            })
        }
    }))

    await Promise.all([createDynamodbPromise, createSchedulePromise])

    return { statusCode: 201 }

}
