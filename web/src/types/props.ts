import type { ReactNode } from "react"

export interface ProviderProps {
  children: ReactNode
}

export interface ContainerProps {
  children: ReactNode
  className?: string
}
