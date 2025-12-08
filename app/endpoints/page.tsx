'use client'

import React, { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchResults from '@/components/SearchResults'
import Sidebar from '@/components/Sidebar'

function EndpointsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // Initialize filters state
  const [filters, setFilters] = useState({
    vulnerabilityScore: [] as string[],
    openssfScore: [] as string[],
    name: '',
    status: [] as string[],
    environment: [] as string[],
    endpointType: [] as string[],
  })

  return (
    <>
      <Sidebar filters={filters} setFilters={setFilters} selectedCategory="image" />
      <SearchResults 
        query={query} 
        category="image" 
        filters={filters}
      />
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading endpoints...</div>}>
      <EndpointsContent />
    </Suspense>
  )
}