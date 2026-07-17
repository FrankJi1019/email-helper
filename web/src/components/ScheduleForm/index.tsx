import { useEffect, useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faComment, faPen, faLock } from "@fortawesome/free-solid-svg-icons"
import type { MessageType, ScheduledMessage } from "../../types/domain"
import { useAuth } from "../../providers/AuthProvider"
import MaskedInput from "../MaskedInput"

export interface ScheduleFormData {
  type: MessageType
  recipient: string
  subject: string
  body: string
  scheduledAt: string
}

export interface ScheduleFormProps {
  onSchedule: (data: ScheduleFormData) => void
  editingMessage?: ScheduledMessage | null
  onCancelEdit?: () => void
}

function parseMaskedToISO(date: string, time: string): string {
  const [day, month, year] = date.split("/")
  const [hour, minute] = time.split(":")
  if (!day || !month || !year || !hour || !minute) return ""
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
}

function isoToMasked(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" }
  const [datePart, timePart] = iso.split("T")
  if (!datePart) return { date: "", time: "" }
  const [year, month, day] = datePart.split("-")
  const time = timePart ? timePart.slice(0, 5) : ""
  return {
    date: `${day}/${month}/${year}`,
    time,
  }
}

const labelClass = "block text-xs font-semibold text-ads-subtle mb-1"

const fieldClass = (hasError: boolean): string =>
  `w-full h-10 px-3 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-ads-red focus:ring-ads-red/20"
      : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
  }`

const ScheduleForm: FC<ScheduleFormProps> = ({ onSchedule, editingMessage, onCancelEdit }) => {
  const { email: profileEmail } = useAuth()

  const [type, setType] = useState<MessageType>("email")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingMessage) {
      setType(editingMessage.type)
      setRecipient(editingMessage.recipient)
      setSubject(editingMessage.subject)
      setBody(editingMessage.body)
      const masked = isoToMasked(editingMessage.scheduledAt)
      setDate(masked.date)
      setTime(masked.time)
      setErrors({})
    }
  }, [editingMessage])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email recipient is always the profile email, so only validate a phone number.
    if (type === "text" && !recipient.trim()) {
      newErrors.recipient = "Phone number is required"
    }

    if (type === "email" && !subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!body.trim()) {
      newErrors.body = "Message body is required"
    }

    if (date.length < 10) {
      newErrors.date = "Enter a valid date (DD/MM/YYYY)"
    }

    if (time.length < 5) {
      newErrors.time = "Enter a valid time (HH:MM)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const scheduledAt = parseMaskedToISO(date, time)

    onSchedule({
      type,
      recipient: type === "email" ? profileEmail : recipient,
      subject: type === "email" ? subject : "",
      body,
      scheduledAt,
    })

    resetForm()
  }

  const resetForm = () => {
    setType("email")
    setRecipient("")
    setSubject("")
    setBody("")
    setDate("")
    setTime("")
    setErrors({})
  }

  const handleCancelEdit = () => {
    resetForm()
    onCancelEdit?.()
  }

  const isEditing = !!editingMessage

  const typeButton = (value: MessageType, label: string, icon: typeof faEnvelope) => {
    const isSelected = type === value
    return (
      <button
        type="button"
        onClick={() => setType(value)}
        className={`flex-1 h-8 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all ${
          isSelected
            ? "bg-white text-ads-blue shadow-sm ring-1 ring-black/[0.03]"
            : "text-ads-subtle hover:text-ads-text"
        }`}
      >
        <FontAwesomeIcon icon={icon} className="text-xs" />
        {label}
      </button>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ads-text mb-1">
        {isEditing ? "Edit message" : "Schedule a message"}
      </h1>
      <p className="text-sm text-ads-subtle mb-6">
        Compose a message and choose when it should be sent.
      </p>

      {isEditing && (
        <div className="flex items-center justify-between bg-ads-blue-subtle rounded-md px-4 py-3 mb-5">
          <span className="flex items-center gap-2 text-sm text-ads-blue">
            <FontAwesomeIcon icon={faPen} className="text-xs" />
            Editing message to {editingMessage.recipient}
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-sm font-medium text-ads-blue hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-ads-border shadow-[0_1px_2px_0_rgba(9,30,66,0.08),0_0_0_1px_rgba(9,30,66,0.03)] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type segmented control */}
          <div>
            <label className={labelClass}>Message type</label>
            <div className="flex w-full gap-1 p-1 rounded-lg bg-ads-neutral">
              {typeButton("email", "Email", faEnvelope)}
              {typeButton("text", "Text", faComment)}
            </div>
          </div>

          {/* Recipient */}
          {type === "email" ? (
            <div>
              <label className={labelClass}>Recipient</label>
              <div className="w-full h-10 px-3 rounded-md border border-ads-border bg-ads-neutral text-sm text-ads-text flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-xs text-ads-subtle" />
                <span className="truncate">{profileEmail || "No profile email"}</span>
              </div>
              <p className="text-xs text-ads-subtle mt-1.5">
                Emails are always sent to your account address.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="recipient" className={labelClass}>Phone number</label>
              <input
                id="recipient"
                type="tel"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+1 555 123 4567"
                className={fieldClass(!!errors.recipient)}
              />
              {errors.recipient && <p className="text-xs text-ads-red mt-1">{errors.recipient}</p>}
            </div>
          )}

          {/* Subject (email only) */}
          {type === "email" && (
            <div>
              <label htmlFor="subject" className={labelClass}>Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Meeting reminder"
                className={fieldClass(!!errors.subject)}
              />
              {errors.subject && <p className="text-xs text-ads-red mt-1">{errors.subject}</p>}
            </div>
          )}

          {/* Body */}
          <div>
            <label htmlFor="body" className={labelClass}>Message</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={4}
              className={`w-full px-3 py-2.5 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none resize-none transition-all focus:ring-2 ${
                errors.body
                  ? "border-ads-red focus:ring-ads-red/20"
                  : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
              }`}
            />
            {errors.body && <p className="text-xs text-ads-red mt-1">{errors.body}</p>}
          </div>

          {/* Date and time */}
          <div>
            <label className={labelClass}>Send at</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <MaskedInput id="date" type="date" value={date} onChange={setDate} hasError={!!errors.date} />
                {errors.date && <p className="text-xs text-ads-red mt-1">{errors.date}</p>}
              </div>
              <div>
                <MaskedInput id="time" type="time" value={time} onChange={setTime} hasError={!!errors.time} />
                {errors.time && <p className="text-xs text-ads-red mt-1">{errors.time}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="h-9 px-4 rounded-md text-sm font-medium text-ads-text hover:bg-ads-neutral transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-sm shadow-ads-blue/25 hover:shadow-md hover:shadow-ads-blue/30 hover:-translate-y-px active:translate-y-0 active:scale-[0.99] transition-all duration-150"
            >
              {isEditing ? "Save changes" : "Schedule message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleForm
