import React from 'react'
import { SidebarProvider } from '@/context/SidebarContext' 
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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