import { createContext, useCallback, useContext, useState } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"

interface AuthContextValue {
  isAuthenticated: boolean
  email: string
  login: (email: string) => void
  logout: () => void
}

const context = createContext<AuthContextValue>({
  isAuthenticated: false,
  email: "",
  login: () => {},
  logout: () => {},
})

const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")

  const login = useCallback((profileEmail: string) => {
    setEmail(profileEmail)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setEmail("")
  }, [])

  return (
    <context.Provider value={{ isAuthenticated, email, login, logout }}>
      {children}
    </context.Provider>
  )
}

export default AuthProvider

export const useAuth = () => useContext(context)
