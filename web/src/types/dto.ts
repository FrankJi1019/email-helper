import { z } from "zod"

export interface MessageResponseDto {
    body: string
    createdAt: string
    id: string
    sendAt: string
    status: "PENDING" | "DISPATCHED" | "FAILED"
    subject: string
    timezone: string
    toEmail: string
    username: string
}

export const MessageResponseDtoSchema = z.object({
    body: z.string(),
    createdAt: z.iso.datetime(),
    id: z.string(),
    sendAt: z.iso.datetime({ offset: false, local: true }),
    status: z.enum(["PENDING", "DISPATCHED", "FAILED"]),
    subject: z.string(),
    timezone: z.string(),
    toEmail: z.email(),
    username: z.string(),
})

export interface ScheduleEmailPayloadDto {
    subject: string,
    body: string,
    sendAt: string,
    timezone: string,
    toEmail: string
}
