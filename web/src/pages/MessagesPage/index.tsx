import { useCallback, type FC } from "react"
import { useNavigate } from "react-router-dom"
import MessagesPage from "./MessagesPage"
import { useNotification } from "../../providers/NotificationProvider"
import {useFetchScheduledEmails, useDeleteScheduledEmail} from "../../api-hooks/scheduled-emails"

const MessagesPageBuilder: FC = () => {
  const notify = useNotification()
  const navigate = useNavigate()

  const { data, refetch } = useFetchScheduledEmails()
  const {mutateAsync} = useDeleteScheduledEmail()

  const handleDelete = useCallback(async (id: string) => {
    await mutateAsync({id})
    await refetch()
    notify("Message deleted", { type: "error" })
  }, [mutateAsync, notify, refetch])

  const handleEdit = (id: string) => {
    console.log("edit", id)
    navigate("/")
  }

  if (!data) {
    return null
  }

  return (
    <MessagesPage
      messages={data}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  )
}

export default MessagesPageBuilder
