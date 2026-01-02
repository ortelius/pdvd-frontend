'use client'

import React, { useState, useEffect } from 'react'
import AuthContext from '@/context/AuthContext'
import { AuthProvider, User, RestAuthProvider } from '@/lib/auth'

interface AuthWrapperProps {
  children: React.ReactNode
  provider?: AuthProvider
}

export default function AuthWrapper({ children, provider }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use provided provider or default to RestAuthProvider
  const authProvider = provider || new RestAuthProvider()

  // 1. Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await authProvider.initialize()
        const user = await authProvider.checkSession()
        setUser(user)
      } catch (error) {
        console.error('Session check failed', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Login Logic
  const login = async (username: string, password: string) => {
    try {
      const user = await authProvider.login({ username, password })
      if (user) {
        setUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error', error)
      return false
    }
  }

  // 3. Logout Logic
  const logout = async () => {
    try {
      await authProvider.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error', error)
    }
  }

  const hasRole = (allowedRoles: string[]) => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}
