'use client'

import React, { useState, useEffect } from 'react'
import AuthContext, { User } from '@/context/AuthContext'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Check Session on Mount (Checks for HttpOnly cookie validity)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          // Expects backend to return { username: "...", role: "..." }
          setUser({ 
            username: data.username, 
            role: data.role || 'viewer' 
          })
        }
      } catch (error) {
        console.error("Session check failed", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // 2. Login Logic (Basic Auth Creds -> Cookie)
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser({ 
          username: data.username || username, 
          role: data.role || 'viewer' 
        })
        return true
      }
    } catch (error) {
      console.error("Login error", error)
    }
    return false
  }

  // 3. Logout Logic
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error("Logout error", error)
    }
  }

  // 4. RBAC Helper
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