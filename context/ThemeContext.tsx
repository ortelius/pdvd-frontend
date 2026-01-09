'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Function to get initial theme from localStorage (only runs on client)
function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem('ortelius_theme')
    return stored === 'dark'
  } catch {
    return false
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with localStorage value to match the blocking script
  const [isDark, setIsDark] = useState(getInitialTheme)

  // Sync with localStorage changes and ensure DOM is updated
  useEffect(() => {
    const stored = localStorage.getItem('ortelius_theme')
    const shouldBeDark = stored === 'dark'
    
    // Update state if it doesn't match localStorage
    if (shouldBeDark !== isDark) {
      setIsDark(shouldBeDark)
    }
    
    // Ensure the DOM class matches the state
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newState = !prev
      localStorage.setItem('ortelius_theme', newState ? 'dark' : 'light')
      if (newState) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newState
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}