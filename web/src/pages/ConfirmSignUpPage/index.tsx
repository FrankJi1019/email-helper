import { useCallback, type FC } from "react"
import { useLocation, useNavigate, Navigate } from "react-router-dom"
import ConfirmSignUpPage from "./ConfirmSignUpPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"
import { Routes } from "../../routes/routes"

interface ConfirmSignUpState {
  username: string
  email: string
}

const ConfirmSignUpPageBuilder: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { confirmSignUp, resendSignUpCode } = useAuth()
  const notify = useNotification()

  const state = location.state as ConfirmSignUpState | null

  const handleConfirm = useCallback(async (code: string) => {
    if (!state) return
    await confirmSignUp(state.username, code)
    notify("Account confirmed! Please log in.", { type: "success" })
    navigate(Routes.LOGIN.path)
  }, [state, confirmSignUp, navigate, notify])

  const handleResend = useCallback(async () => {
    if (!state) return
    await resendSignUpCode(state.username)
    notify("Code resent to your email", { type: "info" })
  }, [state, resendSignUpCode, notify])

  if (!state?.username || !state?.email) {
    return <Navigate to={Routes.LOGIN.path} />
  }

  return (
    <ConfirmSignUpPage
      email={state.email}
      onConfirm={handleConfirm}
      onResend={handleResend}
    />
  )
}

export default ConfirmSignUpPageBuilder
