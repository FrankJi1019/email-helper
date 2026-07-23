import { useMemo, useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faClock, faPen, faTrash, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import type { MessageStatus, ScheduledMessage } from "../../types/domain"

export interface MessageItemProps {
  message: ScheduledMessage
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  index?: number
}

const statusConfig: Record<MessageStatus, { label: string; dot: string; text: string }> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400 shadow-amber-400/50",
    text: "text-amber-600",
  },
  DISPATCHED: {
    label: "Sent",
    dot: "bg-emerald-400 shadow-emerald-400/50",
    text: "text-emerald-600",
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-400 shadow-red-400/50",
    text: "text-red-600",
  },
}

const MessageItem: FC<MessageItemProps> = ({ message, onDelete, onEdit, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedDate = useMemo(() => {
    const d = new Date(message.scheduledAt)
    return d.toLocaleDateString("en-NZ", { weekday: "short", month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })
  }, [message.scheduledAt])

  const preview = useMemo(() => {
    const text = message.subject || message.body
    return text.length > 55 ? text.slice(0, 55) + "…" : text
  }, [message])

  const isPending = message.status === "PENDING"
  const status = statusConfig[message.status]

  return (
    <div
      className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(9,30,66,0.08),0_0_0_1px_rgba(9,30,66,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(9,30,66,0.14),0_0_0_1px_rgba(9,30,66,0.04)] hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${80 + index * 50}ms` }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left transition-colors hover:bg-slate-50/40"
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ads-blue-subtle to-blue-100 text-ads-blue flex items-center justify-center shrink-0 shadow-sm shadow-ads-blue/10 ring-1 ring-white/60">
          <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="text-sm font-semibold text-ads-text truncate">{message.recipient}</span>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-ads-subtle truncate">{preview}</p>
        </div>

        {/* Date + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-ads-disabled hidden sm:block font-medium">{formattedDate}</span>
          <div className={`w-6 h-6 rounded-lg bg-slate-100/80 flex items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-ads-subtle" />
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-5 pb-5">
          <div className="border-t border-slate-100 pt-4 space-y-4 ml-14">
            {/* Date on mobile */}
            <p className="text-[11px] text-ads-subtle sm:hidden flex items-center gap-2 font-medium">
              <FontAwesomeIcon icon={faClock} className="text-[10px]" />
              {formattedDate}
            </p>

            {/* Subject */}
            {message.subject && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ads-disabled mb-1">Subject</p>
                <p className="text-sm text-ads-text font-medium">{message.subject}</p>
              </div>
            )}

            {/* Body */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ads-disabled mb-1">Message</p>
              <p className="text-sm text-ads-text whitespace-pre-wrap leading-relaxed">{message.body}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3">
              {isPending && (
                <button
                  onClick={() => onEdit(message.id)}
                  className="inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold text-ads-text bg-slate-100/80 hover:bg-slate-200/80 transition-all duration-150"
                >
                  <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                  Edit
                </button>
              )}
              <button
                onClick={() => onDelete(message.id)}
                className="inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold text-ads-red bg-ads-red-subtle/60 hover:bg-ads-red-subtle transition-all duration-150"
              >
                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageItem
