import { useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLock, faPaperPlane, faCalendarDays, faClock, faSpinner } from "@fortawesome/free-solid-svg-icons"
import MaskedInput from "../../components/MaskedInput"

export interface SchedulePageProps {
  profileEmail: string
  isSubmitting?: boolean
  onSchedule: (data: {
    email: string; subject: string; body: string; date: string; time: string
  }) => Promise<boolean>
}

const labelClass = "block text-[11px] font-semibold uppercase tracking-wide text-ads-subtle mb-2"

const fieldClass = (hasError: boolean): string =>
  `w-full h-11 px-4 rounded-xl border bg-white/80 backdrop-blur-sm text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all duration-200 focus:ring-2 focus:bg-white ${
    hasError
      ? "border-ads-red/60 focus:ring-ads-red/20 focus:border-ads-red"
      : "border-slate-200/80 focus:border-ads-blue focus:ring-ads-blue/20"
  }`

const SchedulePage: FC<SchedulePageProps> = ({ profileEmail, isSubmitting = false, onSchedule }) => {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!subject.trim()) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const isSuccess = await onSchedule({
      email: profileEmail,
      subject,
      body,
      date,
      time
    })

    if (isSuccess) {
      resetForm()
    }
  }

  const resetForm = () => {
    setSubject("")
    setBody("")
    setDate("")
    setTime("")
    setErrors({})
  }

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-ads-text">
          Schedule an email
        </h1>
        <p className="text-[13px] text-ads-subtle mt-1.5 leading-relaxed">
          Compose your message and pick the perfect moment to send it.
        </p>
      </div>

      {/* Form card — glassmorphic */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(9,30,66,0.12),0_0_0_1px_rgba(9,30,66,0.03)] p-6 sm:p-8 animate-fade-up [animation-delay:60ms]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient (locked) */}
          <div>
            <label className={labelClass}>Recipient</label>
            <div className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/80 text-sm text-ads-text flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-slate-200/60 flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="text-[9px] text-ads-subtle" />
              </div>
              <span className="truncate font-medium">{profileEmail || "No profile email"}</span>
            </div>
            <p className="text-[11px] text-ads-disabled mt-2">
              Emails are always sent to your account address.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className={labelClass}>Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Meeting reminder, Weekly update…"
              className={fieldClass(!!errors.subject)}
            />
            {errors.subject && <p className="text-[11px] text-ads-red mt-1.5 font-medium">{errors.subject}</p>}
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className={labelClass}>Message</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email message here..."
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border bg-white/80 backdrop-blur-sm text-sm text-ads-text placeholder:text-ads-disabled outline-none resize-none transition-all duration-200 focus:ring-2 focus:bg-white leading-relaxed ${
                errors.body
                  ? "border-ads-red/60 focus:ring-ads-red/20 focus:border-ads-red"
                  : "border-slate-200/80 focus:border-ads-blue focus:ring-ads-blue/20"
              }`}
            />
            {errors.body && <p className="text-[11px] text-ads-red mt-1.5 font-medium">{errors.body}</p>}
          </div>

          {/* Date and time */}
          <div>
            <label className={labelClass}>Send at</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-ads-blue-subtle/60 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-[9px] text-ads-blue" />
                  </div>
                  <div className="pl-10">
                    <MaskedInput id="date" type="date" value={date} onChange={setDate} hasError={!!errors.date} />
                  </div>
                </div>
                {errors.date && <p className="text-[11px] text-ads-red mt-1.5 font-medium">{errors.date}</p>}
              </div>
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-ads-blue-subtle/60 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faClock} className="text-[9px] text-ads-blue" />
                  </div>
                  <div className="pl-10">
                    <MaskedInput id="time" type="time" value={time} onChange={setTime} hasError={!!errors.time} />
                  </div>
                </div>
                {errors.time && <p className="text-[11px] text-ads-red mt-1.5 font-medium">{errors.time}</p>}
              </div>
            </div>
          </div>

          {/* Divider + Actions */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2.5 h-10 px-6 rounded-xl bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-md shadow-ads-blue/25 hover:shadow-lg hover:shadow-ads-blue/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPaperPlane} className={`text-xs ${isSubmitting ? "animate-spin" : ""}`} />
                {isSubmitting ? "Scheduling…" : "Schedule email"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SchedulePage
