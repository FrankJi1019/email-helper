import { useCallback, useState } from "react"
import type { FC, SyntheticEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelopeOpenText, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"
import { Routes } from "../../routes/routes"

export interface ForgotPasswordPageProps {
  onSubmit: (email: string) => Promise<void>
}

const fieldClass = (hasError: boolean): string =>
  `w-full h-10 px-3 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-ads-red focus:ring-ads-red/20"
      : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
  }`

const ForgotPasswordPage: FC<ForgotPasswordPageProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = (): boolean => {
    const trimmed = email.trim()
    if (!trimmed) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = useCallback(async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(email.trim())
    } catch {
      setError("Failed to send reset code. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [email, onSubmit])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-ads-neutral flex flex-col items-center px-4 py-12 overflow-hidden">
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
          Forgot your password?
        </h1>
        <p className="text-center text-sm text-ads-subtle mb-6">
          Enter your email and we'll send you a code to reset it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-ads-subtle mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder="you@example.com"
              className={fieldClass(!!error)}
            />
            {error && <p className="text-xs text-ads-red mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 mt-2 rounded-md bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-sm shadow-ads-blue/25 hover:shadow-md hover:shadow-ads-blue/30 hover:-translate-y-px active:translate-y-0 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="text-xs animate-spin" />}
            {isSubmitting ? "Sending code…" : "Send reset code"}
          </button>
        </form>
      </div>

      {/* Back to login */}
      <div className="relative mt-5 text-sm text-ads-subtle animate-fade-up [animation-delay:160ms]">
        Remember your password?{" "}
        <Link to={Routes.LOGIN.path} className="text-ads-blue font-medium hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
