import { useCallback, useState } from "react"
import type { FC, SyntheticEvent } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelopeOpenText, faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { Routes } from "../../routes/routes"

export interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignUp: (username: string, email: string, password: string) => Promise<void>
}

const fieldClass = (hasError: boolean): string =>
  `w-full h-10 px-3 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-ads-red focus:ring-ads-red/20"
      : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
  }`

interface FormErrors {
  username?: string
  email?: string
  password?: string
}

const LoginPage: FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (isSignUp && !username.trim()) {
      newErrors.username = "Username is required"
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = useCallback(async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isSignUp) {
        await onSignUp(username.trim(), email.trim(), password)
      } else {
        await onLogin(email.trim(), password)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onLogin, onSignUp, email, password, username, isSignUp])

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setErrors({})
    setIsPasswordVisible(false)
  }

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
          {/* Username (sign up only) */}
          {isSignUp && (
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-ads-subtle mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={fieldClass(!!errors.username)}
              />
              {errors.username && <p className="text-xs text-ads-red mt-1">{errors.username}</p>}
            </div>
          )}

          {/* Email */}
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

          {/* Password with visibility toggle */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-ads-subtle mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`${fieldClass(!!errors.password)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ads-subtle hover:text-ads-text transition-colors"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} className="text-sm" />
              </button>
            </div>
            {errors.password && <p className="text-xs text-ads-red mt-1">{errors.password}</p>}
          </div>

          {/* Forgot password link (login mode only) */}
          {!isSignUp && (
            <div className="text-right">
              <Link to={Routes.FORGOT_PASSWORD.path} className="text-xs text-ads-blue font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 mt-2 rounded-md bg-gradient-to-b from-ads-blue to-ads-blue-hover text-white text-sm font-semibold shadow-sm shadow-ads-blue/25 hover:shadow-md hover:shadow-ads-blue/30 hover:-translate-y-px active:translate-y-0 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="text-xs animate-spin" />}
            {isSubmitting
              ? (isSignUp ? "Creating account…" : "Logging in…")
              : (isSignUp ? "Sign up" : "Log in")
            }
          </button>
        </form>
      </div>

      {/* Toggle */}
      <div className="relative mt-5 text-sm text-ads-subtle animate-fade-up [animation-delay:160ms]">
        {isSignUp ? "Already have an account?" : "New to Email Helper?"}{" "}
        <button
          onClick={toggleMode}
          className="text-ads-blue font-medium hover:underline"
        >
          {isSignUp ? "Log in" : "Create an account"}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
