import { useCallback, useState } from "react"
import type { FC, SyntheticEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelopeOpenText } from "@fortawesome/free-solid-svg-icons"

export interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>
}

const fieldClass = (hasError: boolean): string =>
  `w-full h-10 px-3 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-ads-red focus:ring-ads-red/20"
      : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
  }`

const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})

  const handleSubmit = useCallback(async (e: SyntheticEvent) => {
    e.preventDefault()
    await onLogin(email.trim(), password)
  }, [onLogin, email, password])

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
        <h1 className="text-center text-lg font-semibold text-ads-text mb-6">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-ads-subtle mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldClass(!!errors.email)}
            />
            {errors.email && <p className="text-xs text-ads-red mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-ads-subtle mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={fieldClass(!!errors.password)}
            />
            {errors.password && <p className="text-xs text-ads-red mt-1">{errors.password}</p>}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-ads-subtle mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={fieldClass(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && <p className="text-xs text-ads-red mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-10 mt-2 rounded-md bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-sm shadow-ads-blue/25 hover:shadow-md hover:shadow-ads-blue/30 hover:-translate-y-px active:translate-y-0 active:scale-[0.99] transition-all duration-150"
          >
            {isSignUp ? "Sign up" : "Log in"}
          </button>
        </form>
      </div>

      {/* Toggle */}
      <div className="relative mt-5 text-sm text-ads-subtle animate-fade-up [animation-delay:160ms]">
        {isSignUp ? "Already have an account?" : "New to Email Helper?"}{" "}
        <button
          onClick={() => { setIsSignUp(!isSignUp); setErrors({}) }}
          className="text-ads-blue font-medium hover:underline"
        >
          {isSignUp ? "Log in" : "Create an account"}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
