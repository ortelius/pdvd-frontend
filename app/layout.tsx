import React from 'react'
import { SidebarProvider } from '@/context/SidebarContext' 
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FIX: Replaced two specific links with a single comprehensive link.
          This link loads the entire Material Symbols font library with ranges for:
          Optical Size (opsz: 20-48), Weight (wght: 100-700), Fill (FILL: 0-1), and Grade (GRAD: -50-200).
          This ensures all symbols, including 'bomb' and 'threat_intelligence', can be styled and rendered.
        */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>
      <body>
        <SidebarProvider>
          {/* Flex container for Page Layouts */}
          <div className="flex min-h-screen">
            {children}
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
