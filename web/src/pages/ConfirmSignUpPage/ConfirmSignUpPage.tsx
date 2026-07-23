import { useCallback, useRef, useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelopeOpenText, faSpinner } from "@fortawesome/free-solid-svg-icons"

export interface ConfirmSignUpPageProps {
  email: string
  onConfirm: (code: string) => Promise<void>
  onResend: () => Promise<void>
}

const ConfirmSignUpPage: FC<ConfirmSignUpPageProps> = ({ email, onConfirm, onResend }) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return

    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ""
    }
    setDigits(newDigits)
    setError("")

    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(code)
    } catch {
      setError("Invalid confirmation code. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [digits, onConfirm])

  const handleResend = useCallback(async () => {
    setIsResending(true)
    try {
      await onResend()
    } finally {
      setIsResending(false)
    }
  }, [onResend])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-ads-neutral flex flex-col items-center px-4 py-12 overflow-hidden">
      {/* Decorative gradient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-ads-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-ads-blue-subtle/60 blur-3xl" />

      {/* Product mark */}
      <div className="relative flex flex-col items-center mb-6 animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ads-blue to-ads-blue-hover flex items-center justify-center mb-3 shadow-lg shadow-ads-blue/30 ring-1 ring-white/20">
          <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-white text-xl" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-ads-text">Email Helper</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[400px] bg-white/90 backdrop-blur-xl rounded-2xl border border-ads-border shadow-[0_12px_32px_-8px_rgba(9,30,66,0.18),0_0_0_1px_rgba(9,30,66,0.04)] px-10 py-9 animate-fade-up [animation-delay:80ms]">
        <h1 className="text-center text-lg font-semibold text-ads-text mb-2">
          Confirm your account
        </h1>
        <p className="text-center text-sm text-ads-subtle mb-6">
          We sent a 6-digit code to <span className="font-medium text-ads-text">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 6-digit code input */}
          <div>
            <label className="block text-xs font-semibold text-ads-subtle mb-2 text-center">
              Confirmation code
            </label>
            <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 text-center text-lg font-semibold rounded-lg border bg-white outline-none transition-all focus:ring-2 ${
                    error
                      ? "border-ads-red focus:ring-ads-red/20"
                      : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-ads-red mt-2 text-center">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-md bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-sm shadow-ads-blue/25 hover:shadow-md hover:shadow-ads-blue/30 hover:-translate-y-px active:translate-y-0 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="text-xs animate-spin" />}
            {isSubmitting ? "Confirming…" : "Confirm account"}
          </button>
        </form>

        {/* Resend link */}
        <div className="mt-4 text-center">
          <span className="text-xs text-ads-subtle">Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-ads-blue font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending…" : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmSignUpPage
