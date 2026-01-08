'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface OrgContextType {
  selectedOrg: string | null
  setSelectedOrg: (org: string | null) => void
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [selectedOrg, setSelectedOrgState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ortelius_selected_org')
    if (stored) {
      setSelectedOrgState(stored)
    }
  }, [])

  const setSelectedOrg = (org: string | null) => {
    setSelectedOrgState(org)
    if (org) {
      localStorage.setItem('ortelius_selected_org', org)
    } else {
      localStorage.removeItem('ortelius_selected_org')
    }
  }

  return (
    <OrgContext.Provider value={{ selectedOrg, setSelectedOrg }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => {
  const context = useContext(OrgContext)
  if (!context) throw new Error('useOrg must be used within OrgProvider')
  return context
}