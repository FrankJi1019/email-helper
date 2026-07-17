import type { FC } from "react"
import ScheduleForm from "../../components/ScheduleForm"
import { useMessages } from "../../providers/MessagesProvider"
import { useNotification } from "../../providers/NotificationProvider"
import type { ScheduleFormData } from "../../components/ScheduleForm"

const SchedulePage: FC = () => {
  const { editingMessage, scheduleMessage, updateMessage, cancelEditing } = useMessages()
  const notify = useNotification()

  const handleSchedule = (data: ScheduleFormData) => {
    if (editingMessage) {
      updateMessage(editingMessage.id, data)
      notify("Message updated!", { type: "success" })
    } else {
      scheduleMessage(data)
      notify("Message scheduled!", { type: "success" })
    }
  }

  return (
    <ScheduleForm
      onSchedule={handleSchedule}
      editingMessage={editingMessage}
      onCancelEdit={cancelEditing}
    />
  )
}

export default SchedulePage
