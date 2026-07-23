import { useCallback, type FC } from "react"
import { useNavigate } from "react-router-dom"
import LoginPage from "./LoginPage"
import { useAuth } from "../../providers/AuthProvider"
import { useNotification } from "../../providers/NotificationProvider"
import { Routes } from "../../routes/routes"

const LoginPageBuilder: FC = () => {
  const { login, signUp } = useAuth()
  const notify = useNotification()
  const navigate = useNavigate()

  const handleLogin = useCallback(async (email: string, password: string) => {
    await login(email, password)
    notify("Welcome back!", { type: "success" })
  }, [login, notify])

  const handleSignUp = useCallback(async (username: string, email: string, password: string) => {
    await signUp(username, email, password)
    navigate(Routes.CONFIRM.path, { state: { username, email } })
  }, [signUp, navigate])

  return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />
}

export default LoginPageBuilder
