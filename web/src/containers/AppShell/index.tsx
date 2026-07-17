import type { FC, ReactNode } from "react"
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

const navLinkClass = (isActive: boolean): string =>
  `flex items-center gap-3 h-9 px-3 rounded-md text-sm transition-colors ${
    isActive
      ? "bg-ads-blue-subtle text-ads-blue font-semibold"
      : "text-ads-text hover:bg-ads-neutral-hover"
  }`

const AppShell: FC<AppShellProps> = ({ children }) => {
  const { email, logout } = useAuth()
  const { pathname } = useLocation()

  const initial = email.trim().charAt(0).toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-white">
      {/* Global top navigation */}
      <header className="fixed top-0 inset-x-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-ads-border shadow-[0_1px_3px_rgba(9,30,66,0.06)] flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ads-blue to-ads-blue-hover flex items-center justify-center shadow-sm shadow-ads-blue/30 ring-1 ring-white/20">
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-white text-sm" />
          </div>
          <span className="text-base font-semibold tracking-tight text-ads-text">Email Helper</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-ads-subtle max-w-[220px] truncate" title={email}>
            {email}
          </span>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-ads-blue to-ads-blue-hover text-white text-sm font-semibold flex items-center justify-center shadow-sm shadow-ads-blue/30 ring-1 ring-white/20"
            title={email}
          >
            {initial}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 h-8 px-3 rounded-md text-sm text-ads-text hover:bg-ads-neutral-hover transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Left sidebar */}
      <aside className="hidden sm:flex flex-col fixed top-14 bottom-0 left-0 w-60 bg-ads-neutral border-r border-ads-border p-3">
        <p className="px-3 pt-2 pb-3 text-xs font-bold uppercase tracking-wide text-ads-subtle">
          Messaging
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, path, icon }) => (
            <NavLink key={path} to={path} end={path === Routes.SCHEDULE.path} className={({ isActive }) => navLinkClass(isActive)}>
              <FontAwesomeIcon icon={icon} className="text-sm w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <main className="pt-14 sm:pl-60">
        <div key={pathname} className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-24 sm:pb-8 animate-fade-up">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white border-t border-ads-border flex items-center justify-around">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === Routes.SCHEDULE.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-6 py-2 text-xs transition-colors ${
                isActive ? "text-ads-blue font-medium" : "text-ads-subtle"
              }`
            }
          >
            <FontAwesomeIcon icon={icon} className="text-base" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppShell
