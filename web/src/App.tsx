import type { FC } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Routes as AppRoutes } from "./routes/routes"
import { useAuth } from "./providers/AuthProvider"
import LoginPageBuilder from "./pages/LoginPage"
import SchedulePage from "./pages/SchedulePage"
import MessagesPage from "./pages/MessagesPage"
import AppShell from "./containers/AppShell"

const App: FC = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={AppRoutes.LOGIN.path} element={<LoginPageBuilder />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path={AppRoutes.SCHEDULE.path} element={<SchedulePage />} />
        <Route path={AppRoutes.MESSAGES.path} element={<MessagesPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )
}

export default App
