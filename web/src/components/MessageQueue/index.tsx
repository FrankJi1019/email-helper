import { useMemo } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInbox } from "@fortawesome/free-solid-svg-icons"
import type { ScheduledMessage } from "../../types/domain"
import MessageItem from "../MessageItem"

export interface MessageQueueProps {
  messages: ScheduledMessage[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const MessageQueue: FC<MessageQueueProps> = ({ messages, onDelete, onEdit }) => {
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }, [messages])

  const pendingCount = messages.filter((m) => m.status === "pending").length
  const sentCount = messages.filter((m) => m.status === "sent").length

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ads-text mb-1">Messages</h1>
      <p className="text-sm text-ads-subtle mb-6">Your scheduled and sent messages.</p>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-ads-border shadow-[0_1px_2px_0_rgba(9,30,66,0.08)] py-16 text-center animate-fade-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ads-blue-subtle to-[#b3d4ff] flex items-center justify-center text-ads-blue shadow-sm shadow-ads-blue/10 animate-pop">
            <FontAwesomeIcon icon={faInbox} className="text-xl" />
          </div>
          <p className="text-sm font-semibold text-ads-text">No messages yet</p>
          <p className="text-xs text-ads-subtle mt-1">
            Schedule your first message and it will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-ads-yellow-subtle text-ads-yellow">
              {pendingCount} pending
            </span>
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-ads-green-subtle text-ads-green">
              {sentCount} sent
            </span>
          </div>

          <div className="space-y-2.5">
            {sortedMessages.map((message, index) => (
              <MessageItem key={message.id} message={message} onDelete={onDelete} onEdit={onEdit} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default MessageQueue
