import { useMemo, type FC, type ReactNode } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPenToSquare,
  faListCheck,
  faArrowRightFromBracket,
  faEnvelopeOpenText,
} from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Routes } from "../../routes/routes"
import { useAuth } from "../../providers/AuthProvider"

interface AppShellProps {
  children: ReactNode
}

const navItems: { label: string; path: string; icon: IconDefinition }[] = [
  { label: "Schedule", path: Routes.SCHEDULE.path, icon: faPenToSquare },
  { label: "Messages", path: Routes.MESSAGES.path, icon: faListCheck },
]

const AppShell: FC<AppShellProps> = ({ children }) => {
  const { userDetail, logout } = useAuth()
  const { pathname } = useLocation()

  const email = useMemo(() => userDetail?.email ?? "", [userDetail])

  const initial = useMemo(() => userDetail?.email?.trim().charAt(0).toUpperCase() || "U", [userDetail])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-ads-blue/[0.04] blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -left-60 w-[600px] h-[600px] rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-3xl" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 h-16 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-[0_1px_3px_rgba(9,30,66,0.04),0_4px_12px_rgba(9,30,66,0.03)] flex items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ads-blue to-ads-blue-hover flex items-center justify-center shadow-lg shadow-ads-blue/25 ring-1 ring-white/30">
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-white text-sm" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ads-text">Email Helper</span>
        </div>

        {/* Desktop navigation tabs — centered */}
        <nav className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-slate-100/70 backdrop-blur-sm rounded-xl p-1 border border-slate-200/50">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === Routes.SCHEDULE.path}
              className={({ isActive }) =>
                `flex items-center gap-2 h-8 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-ads-blue shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]"
                    : "text-ads-subtle hover:text-ads-text"
                }`
              }
            >
              <FontAwesomeIcon icon={icon} className="text-xs" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-ads-subtle max-w-[180px] truncate" title={email}>
            {email}
          </span>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-ads-blue to-indigo-600 text-white text-xs font-semibold flex items-center justify-center shadow-sm shadow-ads-blue/30 ring-2 ring-white"
            title={email}
          >
            {initial}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 h-8 px-3 rounded-lg text-sm text-ads-subtle hover:text-ads-text hover:bg-slate-100/80 transition-all duration-150"
            title="Log out"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="pt-16">
        <div key={pathname} className="max-w-2xl mx-auto px-5 sm:px-8 py-10 pb-28 sm:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-[72px] bg-white/80 backdrop-blur-2xl border-t border-white/60 shadow-[0_-2px_12px_rgba(9,30,66,0.06)] flex items-center justify-around px-6">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === Routes.SCHEDULE.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-ads-blue"
                  : "text-ads-subtle hover:text-ads-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? "bg-ads-blue-subtle shadow-sm" : ""
                }`}>
                  <FontAwesomeIcon icon={icon} className="text-base" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppShell
