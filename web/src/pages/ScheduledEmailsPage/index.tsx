import { useCallback, useState, type FC } from "react"
import ScheduledEmailsPage from "./ScheduledEmailsPage"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchScheduledEmails, useDeleteScheduledEmail } from "../../api-hooks/scheduled-emails"

const ScheduledEmailsPageBuilder: FC = () => {
  const notify = useNotification()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading, isRefetching, refetch } = useFetchScheduledEmails()

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])
  const { mutateAsync } = useDeleteScheduledEmail()

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      await mutateAsync({ id })
      await refetch()
      notify("Scheduled email deleted", { type: "error" })
    } finally {
      setDeletingId(null)
    }
  }, [mutateAsync, notify, refetch])

  return (
    <ScheduledEmailsPage
      scheduledEmails={data ?? []}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      isRefreshing={isRefetching}
      deletingId={deletingId}
    />
  )
}

export default ScheduledEmailsPageBuilder
