'use client'

import Dashboard from '@/components/Dashboard'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <>
      <Sidebar />
      {/* Removed the wrapper div with padding. 
        Dashboard component now manages its own full-height container and internal scrolling.
      */}
      <Dashboard />
    </>
  )
}