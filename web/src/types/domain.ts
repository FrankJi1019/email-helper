export const MESSAGE_STATUS = {
  PENDING: "PENDING",
  DISPATCHED: "DISPATCHED",
  FAILED: "FAILED",
} as const 

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS]

export interface ScheduledMessage {
  id: string
  recipient: string
  subject: string
  body: string
  scheduledAt: Date
  status: MessageStatus
  createdAt: Date
}

export interface UserDetail {
  email: string
  username: string
}