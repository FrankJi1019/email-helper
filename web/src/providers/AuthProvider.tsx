import { createContext, useCallback, useContext } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signIn, signOut } from "aws-amplify/auth"
import type { UserDetail } from "../types/domain"
import { useQuery } from "@tanstack/react-query"

interface AuthContextValue {
  userDetail: UserDetail | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const context = createContext<AuthContextValue>({
  userDetail: null,
  login: async () => { },
  logout: async () => { },
  getAccessToken: async () => Promise.resolve(null)
})

const AuthProvider: FC<ProviderProps> = ({ children }) => {

  const { data: userDetail, refetch: refetchUserDetail } = useQuery({
    queryKey: ["userDetail"],
    queryFn: async () => {
      try {
        const [attributes, user] = await Promise.all([
          fetchUserAttributes(), getCurrentUser()
        ])
        return {
          username: user.username,
          email: attributes.email
        } as UserDetail
      } catch (e) {
        return null
      }
    }
  })

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const session = await fetchAuthSession()
    return session.tokens?.accessToken?.toString() ?? null
  }, [fetchAuthSession])

  const login = useCallback(async (email: string, password: string) => {
    await signIn({
      username: email, password
    })
    await refetchUserDetail()
  }, [signIn, refetchUserDetail])

  const logout = useCallback(async () => {
    await signOut()
    await refetchUserDetail()
  }, [signOut, refetchUserDetail])

  return (
    <context.Provider value={{ userDetail: userDetail ?? null, login, logout, getAccessToken }}>
      {children}
    </context.Provider>
  )
}

export default AuthProvider

export const useAuth = () => useContext(context)
