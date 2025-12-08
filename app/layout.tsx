import type { Metadata } from 'next'
import './globals.css'
import React from 'react'
// import Header from '@/components/Header' <-- REMOVE THIS IMPORT

export const metadata: Metadata = {
  title: 'Ortelius',
  description: 'Ortelius Clone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">   
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>    
      <body className="flex flex-col h-screen bg-gray-50 overflow-hidden text-sm">
         {/* Fixed Header REMOVED - Space Reclaimed */}
         
         <div className="flex flex-1 overflow-hidden">
            {/* Main Content Area - Sidebar is handled within children pages */}
            <main className="flex-1 overflow-y-auto flex">
               {children}
            </main>
         </div>
      </body>
    </html>
  )
}