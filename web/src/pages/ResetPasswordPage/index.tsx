import { useCallback, type FC } from "react"
import { useLocation, useNavigate, Navigate } from "react-router-dom"
import ResetPasswordPage from "./ResetPasswordPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"
import { Routes } from "../../routes/routes"

interface ResetPasswordState {
  email: string
}

const ResetPasswordPageBuilder: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { confirmResetPassword } = useAuth()
  const notify = useNotification()

  const state = location.state as ResetPasswordState | null

  const handleSubmit = useCallback(async (code: string, newPassword: string) => {
    if (!state) return
    await confirmResetPassword(state.email, code, newPassword)
    notify("Password reset successfully! Please log in.", { type: "success" })
    navigate(Routes.LOGIN.path)
  }, [state, confirmResetPassword, navigate, notify])

  if (!state?.email) {
    return <Navigate to={Routes.FORGOT_PASSWORD.path} />
  }

  return (
    <ResetPasswordPage
      email={state.email}
      onSubmit={handleSubmit}
    />
  )
}

export default ResetPasswordPageBuilder
