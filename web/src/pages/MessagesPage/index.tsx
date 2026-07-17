import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import MessageQueue from "../../components/MessageQueue"
import { useMessages } from "../../providers/MessagesProvider"
import { useNotification } from "../../providers/NotificationProvider"

const MessagesPage: FC = () => {
  const { messages, deleteMessage, startEditing } = useMessages()
  const notify = useNotification()
  const navigate = useNavigate()

  const handleDelete = (id: string) => {
    deleteMessage(id)
    notify("Message deleted", { type: "error" })
  }

  const handleEdit = (id: string) => {
    startEditing(id)
    navigate("/")
  }

  return <MessageQueue messages={messages} onDelete={handleDelete} onEdit={handleEdit} />
}

export default MessagesPage
