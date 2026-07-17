import type { FC } from "react"
import LoginPage from "./LoginPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"

const LoginPageBuilder: FC = () => {
  const { login } = useAuth()
  const notify = useNotification()

  const handleLogin = (email: string) => {
    login(email)
    notify("Welcome back!", { type: "success" })
  }

  return <LoginPage onLogin={handleLogin} />
}

export default LoginPageBuilder
