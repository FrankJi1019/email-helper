import { createContext, useCallback, useContext, useState } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"
import type { ScheduledMessage } from "../types/domain"

interface ScheduleData {
  type: "email" | "text"
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
    type: "email",
    recipient: "alice@example.com",
    subject: "Weekly standup notes",
    body: "Hi Alice, here are the notes from today's standup. Let me know if I missed anything.",
    scheduledAt: "2026-07-10T09:00",
    status: "pending",
    createdAt: "2026-07-07T14:00",
  },
  {
    id: "2",
    type: "text",
    recipient: "+64 21 555 1234",
    subject: "",
    body: "Don't forget to pick up milk on your way home!",
    scheduledAt: "2026-07-08T17:30",
    status: "pending",
    createdAt: "2026-07-07T10:00",
  },
  {
    id: "3",
    type: "email",
    recipient: "team@company.co",
    subject: "Sprint retro reminder",
    body: "Hey team, just a reminder that our sprint retro is tomorrow at 3pm. Please come prepared with your feedback.",
    scheduledAt: "2026-07-05T14:00",
    status: "sent",
    createdAt: "2026-07-04T09:00",
  },
  {
    id: "4",
    type: "text",
    recipient: "+1 555 777 8888",
    subject: "",
    body: "Your appointment is confirmed for Thursday 10am. Reply STOP to cancel.",
    scheduledAt: "2026-07-09T08:00",
    status: "pending",
    createdAt: "2026-07-06T16:30",
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
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const updateMessage = useCallback((id: string, data: ScheduleData) => {
    setMessages((prev) =>
      prev.map((msg) => msg.id === id ? { ...msg, ...data } : msg)
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
