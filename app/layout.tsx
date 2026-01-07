import React from 'react'
import type { Metadata } from 'next'
import { SidebarProvider } from '@/context/SidebarContext' 
import { ThemeProvider } from '@/context/ThemeContext'
import { ExportProvider } from '@/context/ExportContext'
import AuthWrapper from '@/components/AuthWrapper' 
import ExportManager from '@/components/ExportManager'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ortelius - Post-Deployment Vulnerability Dashboard',
    template: '%s | Ortelius'
  },
  description: 'Track and manage open-source vulnerabilities across deployed endpoints and releases.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://app.ortelius.io" />
        <link rel="dns-prefetch" href="https://app.ortelius.io" />
      </head>
      <body>
        <ThemeProvider>
          <AuthWrapper>
            <ExportProvider>
              <SidebarProvider>
                <div className="flex min-h-screen">
                  <ExportManager />
                  {children}
                </div>
              </SidebarProvider>
            </ExportProvider>
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}