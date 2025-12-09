'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  isExpanded: boolean // Reverted to isExpanded to match your types
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem('ortelius_sidebar_collapsed')
    // If stored state says "collapsed", set expanded to false
    if (storedState === 'true') {
      setIsExpanded(false)
    }
  }, [])

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const newState = !prev
      // Store "collapsed=true" if we are closing it (newState is false)
      localStorage.setItem('ortelius_sidebar_collapsed', String(!newState))
      return newState
    })
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}