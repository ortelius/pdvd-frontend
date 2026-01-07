'use client'

import React, { createContext, useContext, useState } from 'react'

interface ExportContextType {
  isExportMode: boolean
  toggleExportMode: () => void
  setExportMode: (active: boolean) => void
}

const ExportContext = createContext<ExportContextType | undefined>(undefined)

export function ExportProvider({ children }: { children: React.ReactNode }) {
  const [isExportMode, setIsExportMode] = useState(false)

  const toggleExportMode = () => setIsExportMode(prev => !prev)
  const setExportMode = (active: boolean) => setIsExportMode(active)

  return (
    <ExportContext.Provider value={{ isExportMode, toggleExportMode, setExportMode }}>
      {children}
    </ExportContext.Provider>
  )
}

export const useExport = () => {
  const context = useContext(ExportContext)
  if (!context) throw new Error('useExport must be used within an ExportProvider')
  return context
}