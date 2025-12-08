'use client'

import Dashboard from '@/components/Dashboard'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 px-6 py-6">
        <Dashboard />
      </div>
    </>
  )
}