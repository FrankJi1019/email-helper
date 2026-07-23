import { useMemo } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInbox } from "@fortawesome/free-solid-svg-icons"
import type { ScheduledMessage } from "../../types/domain"
import MessageItem from "../../components/MessageItem"

export interface MessagesPageProps {
  messages: ScheduledMessage[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const MessagesPage: FC<MessagesPageProps> = ({ messages, onDelete, onEdit }) => {
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [messages])

  const pendingCount = messages.filter((m) => m.status === "PENDING").length
  const sentCount = messages.filter((m) => m.status === "DISPATCHED").length

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-ads-text">Messages</h1>
        <p className="text-[13px] text-ads-subtle mt-1.5 leading-relaxed">
          Your scheduled and sent emails at a glance.
        </p>
      </div>

      {messages.length === 0 ? (
        /* Empty state — premium card */
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(9,30,66,0.12),0_0_0_1px_rgba(9,30,66,0.03)] py-20 text-center animate-fade-up [animation-delay:60ms]">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-ads-blue-subtle to-blue-100 flex items-center justify-center text-ads-blue shadow-lg shadow-ads-blue/10 ring-1 ring-white/60 animate-pop">
            <FontAwesomeIcon icon={faInbox} className="text-2xl" />
          </div>
          <p className="text-base font-semibold text-ads-text">No emails yet</p>
          <p className="text-sm text-ads-subtle mt-1.5 max-w-[240px] mx-auto">
            Schedule your first email and it will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary card — glassmorphic */}
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
                {messages.length} total
              </span>
            </div>
          </div>

          {/* Message list */}
          <div className="space-y-3">
            {sortedMessages.map((message, index) => (
              <MessageItem key={message.id} message={message} onDelete={onDelete} onEdit={onEdit} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default MessagesPage
