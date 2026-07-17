import { useMemo, useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faComment, faClock, faPen, faTrash, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import type { MessageStatus, ScheduledMessage } from "../../types/domain"

export interface MessageItemProps {
  message: ScheduledMessage
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  index?: number
}

const lozengeConfig: Record<MessageStatus, { label: string; styles: string }> = {
  pending: {
    label: "Pending",
    styles: "bg-ads-yellow-subtle text-ads-yellow",
  },
  sent: {
    label: "Sent",
    styles: "bg-ads-green-subtle text-ads-green",
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
    const text = message.type === "email" ? message.subject : message.body
    return text.length > 60 ? text.slice(0, 60) + "…" : text
  }, [message])

  const isPending = message.status === "pending"
  const lozenge = lozengeConfig[message.status]

  return (
    <div
      className="rounded-lg bg-white border border-ads-border shadow-[0_1px_2px_0_rgba(9,30,66,0.06)] overflow-hidden transition-all duration-200 hover:shadow-[0_6px_16px_-6px_rgba(9,30,66,0.18)] hover:-translate-y-0.5 hover:border-ads-blue/30 animate-fade-up"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-ads-neutral/60 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ads-blue-subtle to-[#b3d4ff] text-ads-blue flex items-center justify-center shrink-0 shadow-sm shadow-ads-blue/10">
          <FontAwesomeIcon icon={message.type === "email" ? faEnvelope : faComment} className="text-sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-ads-text truncate">{message.recipient}</span>
            <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${lozenge.styles}`}>
              {lozenge.label}
            </span>
          </div>
          <p className="text-xs text-ads-subtle truncate">{preview}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-ads-subtle hidden sm:block">{formattedDate}</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-xs text-ads-subtle transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-ads-border pt-4 space-y-3">
            <p className="text-xs text-ads-subtle sm:hidden flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
              {formattedDate}
            </p>

            {message.type === "email" && message.subject && (
              <div>
                <p className="text-xs font-semibold text-ads-subtle mb-0.5">Subject</p>
                <p className="text-sm text-ads-text">{message.subject}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-ads-subtle mb-0.5">Message</p>
              <p className="text-sm text-ads-text whitespace-pre-wrap leading-relaxed">{message.body}</p>
            </div>

            {isPending && (
              <div className="flex items-center gap-2 pt-3 border-t border-ads-border">
                <button
                  onClick={() => onEdit(message.id)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium text-ads-text hover:bg-ads-neutral transition-colors"
                >
                  <FontAwesomeIcon icon={faPen} className="text-xs" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium text-ads-red hover:bg-ads-red-subtle transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageItem
