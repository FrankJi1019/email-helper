import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';

const DYNAMODB_TABLE_NAME = "scheduled-emails" as const
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient())
const ses = new SESClient()
const FROM_EMAIL_ADDRESS = "noreply@frankji.com"
const EMAIL_TEMPLATE_NAME = "ScheduledEmailNotification"

const IdPayloadSchema = z.object({
    id: z.uuid(),
})

const updateStatus = async (id: string, status: "DISPATCHED" | "FAILED", extra?: Record<string, unknown>) => {
    await dynamodb.send(new UpdateCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Key: { id },
        UpdateExpression: extra
            ? "SET #status = :status, errorMessage = :err"
            : "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: extra
            ? { ":status": status, ":err": extra.errorMessage }
            : { ":status": status },
    }))
}

export const handler = async (event: unknown) => {
    const parsedPayload = IdPayloadSchema.safeParse(event)

    if (!parsedPayload.success) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: z.treeifyError(parsedPayload.error) })
        }
    }

    const { id } = parsedPayload.data

    const result = await dynamodb.send(new GetCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Key: { id }
    }))

    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: `Schedule with id ${id} not found` })
        }
    }

    const { subject, body, toEmail } = result.Item

    try {
        await ses.send(new SendTemplatedEmailCommand({
            Source: FROM_EMAIL_ADDRESS,
            Destination: {
                ToAddresses: [toEmail]
            },
            Template: EMAIL_TEMPLATE_NAME,
            TemplateData: JSON.stringify({
                SUBJECT: subject,
                CONTENT: body
            })
        }))
        await updateStatus(id, "DISPATCHED")
    } catch (err) {
        await updateStatus(id, "FAILED", { errorMessage: err instanceof Error ? err.message : String(err) })
        throw err
    }

}