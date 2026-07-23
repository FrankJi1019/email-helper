import { useMemo, type FC } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Routes as AppRoutes } from "./routes/routes"
import { useAuth } from "./providers/AuthProvider"
import LoginPageBuilder from "./pages/LoginPage"
import SchedulePageBuilder from "./pages/SchedulePage"
import ScheduledEmailsPageBuilder from "./pages/ScheduledEmailsPage"
import AppShell from "./containers/AppShell"

const App: FC = () => {
  const { userDetail } = useAuth()

  const isAuthenticated = useMemo(() => !!userDetail, [userDetail])

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
        <Route path={AppRoutes.SCHEDULE.path} element={<SchedulePageBuilder />} />
        <Route path={AppRoutes.MESSAGES.path} element={<ScheduledEmailsPageBuilder />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )
}

export default App
