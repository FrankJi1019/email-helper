import { useCallback, type FC } from "react"
import { useNavigate } from "react-router-dom"
import ForgotPasswordPage from "./ForgotPasswordPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"
import { Routes } from "../../routes/routes"

const ForgotPasswordPageBuilder: FC = () => {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const notify = useNotification()

  const handleSubmit = useCallback(async (email: string) => {
    await resetPassword(email)
    notify("Reset code sent to your email", { type: "info" })
    navigate(Routes.RESET_PASSWORD.path, { state: { email } })
  }, [resetPassword, navigate, notify])

  return <ForgotPasswordPage onSubmit={handleSubmit} />
}

export default ForgotPasswordPageBuilder
