export type MessageType = "email" | "text"

export type MessageStatus = "pending" | "sent"

export interface ScheduledMessage {
  id: string
  type: MessageType
  recipient: string
  subject: string
  body: string
  scheduledAt: string
  status: MessageStatus
  createdAt: string
}
