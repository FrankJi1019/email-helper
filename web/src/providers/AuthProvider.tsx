import { createContext, useCallback, useContext } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"
import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signIn, signOut, signUp as cognitoSignUp, confirmSignUp as cognitoConfirmSignUp, resendSignUpCode as cognitoResendSignUpCode, resetPassword as cognitoResetPassword, confirmResetPassword as cognitoConfirmResetPassword } from "aws-amplify/auth"
import type { UserDetail } from "../types/domain"
import { useQuery } from "@tanstack/react-query"

interface AuthContextValue {
  userDetail: UserDetail | null
  login: (email: string, password: string) => Promise<void>
  signUp: (username: string, email: string, password: string) => Promise<void>
  confirmSignUp: (username: string, code: string) => Promise<void>
  resendSignUpCode: (username: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const context = createContext<AuthContextValue>({
  userDetail: null,
  login: async () => { },
  signUp: async () => { },
  confirmSignUp: async () => { },
  resendSignUpCode: async () => { },
  resetPassword: async () => { },
  confirmResetPassword: async () => { },
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

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    await cognitoSignUp({
      username, password, options: { userAttributes: { email } }
    })
  }, [cognitoSignUp])

  const confirmSignUp = useCallback(async (username: string, code: string) => {
    await cognitoConfirmSignUp({ username, confirmationCode: code })
  }, [cognitoConfirmSignUp])

  const resendSignUpCode = useCallback(async (username: string) => {
    await cognitoResendSignUpCode({ username })
  }, [cognitoResendSignUpCode])

  const resetPassword = useCallback(async (email: string) => {
    await cognitoResetPassword({ username: email })
  }, [cognitoResetPassword])

  const confirmResetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    await cognitoConfirmResetPassword({ username: email, confirmationCode: code, newPassword })
  }, [cognitoConfirmResetPassword])

  const logout = useCallback(async () => {
    await signOut()
    await refetchUserDetail()
  }, [signOut, refetchUserDetail])

  return (
    <context.Provider value={{ userDetail: userDetail ?? null, login, signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, logout, getAccessToken }}>
      {children}
    </context.Provider>
  )
}

export default AuthProvider

export const useAuth = () => useContext(context)
