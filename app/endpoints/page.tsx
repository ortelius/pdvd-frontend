'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchResults from '@/components/SearchResults'

function EndpointsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <SearchResults 
      query={query} 
      category="image" 
    />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <EndpointsContent />
    </Suspense>
  )
}