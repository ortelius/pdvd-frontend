'use client'

import React, { useState, useEffect } from 'react'
import AuthContext from '@/context/AuthContext'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Check for existing session on mount (HttpOnly cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Your Go Backend endpoint that validates the cookie
        const res = await fetch('/api/auth/me') 
        if (res.ok) {
          const data = await res.json()
          setUser({ username: data.username })
        }
      } catch (error) {
        console.error("Session check failed", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // 2. Login Logic: Send Basic Auth creds to Backend
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser({ username: data.username || username })
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}