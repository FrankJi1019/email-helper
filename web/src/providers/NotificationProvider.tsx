import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faCircleCheck, faCircleExclamation, faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import type { ProviderProps } from "../types/props"

type NotificationType = "success" | "error" | "info"

interface NotificationOptions {
  type?: NotificationType
}

const context = createContext((() => {}) as (message: string, options?: NotificationOptions) => void)

const iconConfig: Record<NotificationType, { icon: IconDefinition; color: string; accent: string }> = {
  success: { icon: faCircleCheck, color: "text-ads-green", accent: "bg-ads-green" },
  error: { icon: faCircleExclamation, color: "text-ads-red", accent: "bg-ads-red" },
  info: { icon: faCircleInfo, color: "text-ads-blue", accent: "bg-ads-blue" },
}

const NotificationProvider: FC<ProviderProps> = ({ children }) => {
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<NotificationType>("info")

  const notify = useCallback((message: string, options?: NotificationOptions) => {
    setMessage(message)
    setType(options?.type || "info")
    setIsOpen(true)
    setTimeout(() => setIsOpen(false), 4000)
  }, [])

  const config = useMemo(() => iconConfig[type], [type])

  return (
    <context.Provider value={notify}>
      {children}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[340px] bg-white rounded-lg border border-ads-border shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.06)] pl-0 pr-4 py-3.5 flex items-stretch gap-3 overflow-hidden animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)]">
          <span className={`w-1 shrink-0 rounded-full ${config.accent}`} />
          <FontAwesomeIcon icon={config.icon} className={`mt-0.5 text-base ${config.color}`} />
          <span className="flex-1 text-sm text-ads-text self-center">{message}</span>
          <button
            onClick={() => setIsOpen(false)}
            className="self-start text-ads-subtle hover:text-ads-text transition-colors"
            aria-label="Dismiss"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>
      )}
    </context.Provider>
  )
}

export default NotificationProvider

export const useNotification = () => useContext(context)
