import React from 'react'
import { SidebarProvider } from '@/context/SidebarContext' 
import AuthWrapper from '@/components/AuthWrapper' 
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>
      <body>
        <AuthWrapper>
          <SidebarProvider>
            <div className="flex min-h-screen">
              {children}
            </div>
          </SidebarProvider>
        </AuthWrapper>
      </body>
    </html>
  )
}