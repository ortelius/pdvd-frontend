import React from 'react'
import { SidebarProvider } from '@/context/SidebarContext' 
import AuthWrapper from '@/components/AuthWrapper' 
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols font removed - using local SVG icons instead */}
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