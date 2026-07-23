import { useMemo } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInbox, faSpinner, faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import type { ScheduledMessage } from "../../types/domain"
import ScheduledEmailItem from "../../components/ScheduledEmailItem"

export interface ScheduledEmailsPageProps {
  scheduledEmails: ScheduledMessage[]
  onDelete: (id: string) => void
  onRefresh: () => void
  isLoading?: boolean
  isRefreshing?: boolean
  deletingId: string | null
}

const ScheduledEmailsPage: FC<ScheduledEmailsPageProps> = ({ scheduledEmails, onDelete, onRefresh, isLoading = false, isRefreshing = false, deletingId }) => {
  const sortedEmails = useMemo(() => {
    return [...scheduledEmails].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [scheduledEmails])

  const pendingCount = scheduledEmails.filter((m) => m.status === "PENDING").length
  const sentCount = scheduledEmails.filter((m) => m.status === "DISPATCHED").length

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-ads-text">Scheduled Emails</h1>
          <p className="text-[13px] text-ads-subtle mt-1.5 leading-relaxed">
            Your scheduled and sent emails at a glance.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="text-2xl text-ads-blue animate-spin" />
            <p className="text-sm text-ads-subtle">Loading scheduled emails…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-ads-text">Scheduled Emails</h1>
          <p className="text-[13px] text-ads-subtle mt-1.5 leading-relaxed">
            Your scheduled and sent emails at a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs font-semibold text-ads-text bg-white/80 border border-slate-200/80 shadow-sm hover:bg-slate-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh"
        >
          <FontAwesomeIcon icon={faArrowsRotate} className={`text-xs ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {scheduledEmails.length === 0 ? (
        /* Empty state */
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(9,30,66,0.12),0_0_0_1px_rgba(9,30,66,0.03)] py-20 text-center animate-fade-up [animation-delay:60ms]">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-ads-blue-subtle to-blue-100 flex items-center justify-center text-ads-blue shadow-lg shadow-ads-blue/10 ring-1 ring-white/60 animate-pop">
            <FontAwesomeIcon icon={faInbox} className="text-2xl" />
          </div>
          <p className="text-base font-semibold text-ads-text">No scheduled emails yet</p>
          <p className="text-sm text-ads-subtle mt-1.5 max-w-[240px] mx-auto">
            Schedule your first email and it will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(9,30,66,0.12),0_0_0_1px_rgba(9,30,66,0.03)] p-5 mb-6 animate-fade-up [animation-delay:60ms]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span className="text-sm font-semibold text-ads-text">{pendingCount}</span>
                <span className="text-xs text-ads-subtle">pending</span>
              </div>
              <div className="w-px h-4 bg-slate-200/80" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-semibold text-ads-text">{sentCount}</span>
                <span className="text-xs text-ads-subtle">sent</span>
              </div>
              <span className="ml-auto text-[11px] font-medium text-ads-disabled uppercase tracking-wide">
                {scheduledEmails.length} total
              </span>
            </div>
          </div>

          {/* Email list */}
          <div className="space-y-3">
            {sortedEmails.map((email, index) => (
              <ScheduledEmailItem
                key={email.id}
                scheduledEmail={email}
                onDelete={onDelete}
                isDeleting={deletingId === email.id}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ScheduledEmailsPage
