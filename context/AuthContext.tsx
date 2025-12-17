'use client'
import { createContext, useContext } from 'react'

export interface User {
  username: string
  role: 'admin' | 'editor' | 'viewer'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  hasRole: (allowedRoles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthWrapper')
  return context
}

export default AuthContext