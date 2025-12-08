'use client'

import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-6 py-6">
        <Dashboard />
      </div>
    </div>
  )
}