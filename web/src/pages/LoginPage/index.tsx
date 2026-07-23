import { useCallback, type FC } from "react"
import LoginPage from "./LoginPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"

const LoginPageBuilder: FC = () => {
  const { login } = useAuth()
  const notify = useNotification()

  const handleLogin = useCallback(async (email: string, password: string) => {
    await login(email, password)
    notify("Welcome back!", { type: "success" })
  }, [login, notify])

  return <LoginPage onLogin={handleLogin} />
}

export default LoginPageBuilder
