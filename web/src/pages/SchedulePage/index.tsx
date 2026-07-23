import { useCallback, type FC } from "react"
import SchedulePage from "./SchedulePage"
import { useNotification } from "../../providers/NotificationProvider"
import { useAuth } from "../../providers/AuthProvider"
import moment from "moment"
import type { ScheduleEmailPayloadDto } from "../../types/dto"
import { useCreateScheduledEmail } from "../../api-hooks/scheduled-emails"

const SchedulePageBuilder: FC = () => {
  const { userDetail } = useAuth()
  const notify = useNotification()

  const { mutateAsync } = useCreateScheduledEmail()

  const handleSchedule = useCallback(async ({email, subject, body, date, time}: {
    email: string; subject: string; body: string; date: string; time: string
  }) => {
    const formattedDate = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")
    const datetime = `${formattedDate}T${time}`
    const payload: ScheduleEmailPayloadDto = {
      toEmail: email, body, subject, sendAt: datetime, timezone: "Pacific/Auckland"
    }
    try {
      await mutateAsync(payload)
      notify("Email scheduled", { type: "success" })
    } catch {
      notify("ERROR: Failed to create", { type: "error" })
    }
  }, [mutateAsync])

  return (
    <SchedulePage
      profileEmail={userDetail?.email ?? ""}
      onSchedule={handleSchedule}
    />
  )
}

export default SchedulePageBuilder
