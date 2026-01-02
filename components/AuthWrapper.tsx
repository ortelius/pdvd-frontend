'use client'

import React, { useState, useEffect } from 'react'
import AuthContext, { User } from '@/context/AuthContext'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper to get the REST endpoint from the internal config route
const getRestEndpoint = async () => {
  const res = await fetch('/api/config')
  
  // Safety check: ensure the response is OK and is JSON
  if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
    console.error('Failed to load config, received HTML/Error instead of JSON')
    // Fallback to a safe default if config fails
    return 'http://localhost:3000/api/v1' 
  }

  const config = await res.json()
  return config.restEndpoint || 'http://localhost:3000/api/v1'
}

  // 1. Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const restEndpoint = await getRestEndpoint()
        const res = await fetch(`${restEndpoint}/auth/me`)
        if (res.ok) {
          const data = await res.json()
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

  // 2. Login Logic
  const login = async (username: string, password: string) => {
    try {
      const restEndpoint = await getRestEndpoint()
      const res = await fetch(`${restEndpoint}/auth/login`, {
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
      const restEndpoint = await getRestEndpoint()
      await fetch(`${restEndpoint}/auth/logout`, { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error("Logout error", error)
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