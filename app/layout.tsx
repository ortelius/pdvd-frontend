import React from 'react'
import type { Metadata } from 'next'
import { SidebarProvider } from '@/context/SidebarContext' 
import { ThemeProvider } from '@/context/ThemeContext'
import AuthWrapper from '@/components/AuthWrapper' 
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ortelius - Post-Deployment Vulnerability Dashboard',
    template: '%s | Ortelius'
  },
  description: 'Track and manage open-source vulnerabilities across deployed endpoints and releases. Monitor MTTR, SLA compliance, and security metrics for containerized applications.',
  keywords: [
    'vulnerability management',
    'security dashboard',
    'SBOM',
    'software bill of materials',
    'container security',
    'CVE tracking',
    'DevSecOps',
    'post-deployment security',
    'OpenSSF Scorecard',
    'supply chain security'
  ],
  authors: [{ name: 'Ortelius' }],
  creator: 'Ortelius',
  publisher: 'Ortelius',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://app.ortelius.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ortelius - Post-Deployment Vulnerability Dashboard',
    description: 'Track and manage open-source vulnerabilities across deployed endpoints and releases',
    url: 'https://app.ortelius.io',
    siteName: 'Ortelius',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ortelius - Post-Deployment Vulnerability Dashboard',
    description: 'Track and manage open-source vulnerabilities across deployed endpoints and releases',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
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
        {/* Preconnect to API endpoint for faster GraphQL queries */}
        <link rel="preconnect" href="https://app.ortelius.io" />
        <link rel="dns-prefetch" href="https://app.ortelius.io" />
      </head>
      <body>
        <ThemeProvider>
          <AuthWrapper>
            <SidebarProvider>
              <div className="flex min-h-screen">
                {children}
              </div>
            </SidebarProvider>
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
