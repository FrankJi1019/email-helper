import { createContext, useCallback, useContext, useState } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"
import type { ScheduledMessage } from "../types/domain"
import { MESSAGE_STATUS } from "../types/domain"

export interface ScheduleData {
  recipient: string
  subject: string
  body: string
  scheduledAt: string
}

interface MessagesContextValue {
  messages: ScheduledMessage[]
  editingMessage: ScheduledMessage | null
  scheduleMessage: (data: ScheduleData) => void
  updateMessage: (id: string, data: ScheduleData) => void
  deleteMessage: (id: string) => void
  startEditing: (id: string) => void
  cancelEditing: () => void
}

const SAMPLE_MESSAGES: ScheduledMessage[] = [
  {
    id: "1",
    recipient: "alice@example.com",
    subject: "Weekly standup notes",
    body: "Hi Alice, here are the notes from today's standup. Let me know if I missed anything.",
    scheduledAt: new Date("2026-07-10T09:00"),
    status: MESSAGE_STATUS.PENDING,
    createdAt: new Date("2026-07-07T14:00"),
  },
  {
    id: "2",
    recipient: "team@company.co",
    subject: "Sprint retro reminder",
    body: "Hey team, just a reminder that our sprint retro is tomorrow at 3pm. Please come prepared with your feedback.",
    scheduledAt: new Date("2026-07-05T14:00"),
    status: MESSAGE_STATUS.DISPATCHED,
    createdAt: new Date("2026-07-04T09:00"),
  },
  {
    id: "3",
    recipient: "bob@example.com",
    subject: "Catch up this week?",
    body: "Hey Bob, are you free for a coffee catch-up this week? Would love to hear how the new project is going.",
    scheduledAt: new Date("2026-07-09T08:00"),
    status: MESSAGE_STATUS.PENDING,
    createdAt: new Date("2026-07-06T16:30"),
  },
]

const context = createContext<MessagesContextValue>({
  messages: [],
  editingMessage: null,
  scheduleMessage: () => {},
  updateMessage: () => {},
  deleteMessage: () => {},
  startEditing: () => {},
  cancelEditing: () => {},
})

const MessagesProvider: FC<ProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ScheduledMessage[]>(SAMPLE_MESSAGES)
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null)

  const scheduleMessage = useCallback((data: ScheduleData) => {
    const newMessage: ScheduledMessage = {
      id: crypto.randomUUID(),
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: new Date(data.scheduledAt),
      status: MESSAGE_STATUS.PENDING,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const updateMessage = useCallback((id: string, data: ScheduleData) => {
    setMessages((prev) =>
      prev.map((msg) => msg.id === id ? { ...msg, recipient: data.recipient, subject: data.subject, body: data.body, scheduledAt: new Date(data.scheduledAt) } : msg)
    )
    setEditingMessage(null)
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
    if (editingMessage?.id === id) setEditingMessage(null)
  }, [editingMessage])

  const startEditing = useCallback((id: string) => {
    const message = messages.find((msg) => msg.id === id)
    if (message) setEditingMessage(message)
  }, [messages])

  const cancelEditing = useCallback(() => {
    setEditingMessage(null)
  }, [])

  return (
    <context.Provider value={{ messages, editingMessage, scheduleMessage, updateMessage, deleteMessage, startEditing, cancelEditing }}>
      {children}
    </context.Provider>
  )
}

export default MessagesProvider

export const useMessages = () => useContext(context)
