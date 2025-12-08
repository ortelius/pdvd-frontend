'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Mitigation } from '@/lib/types'
import { graphqlQuery, GET_VULNERABILITIES } from '@/lib/graphql'

interface GetVulnerabilitiesResponse {
  vulnerabilities: Mitigation[]
}

export default function VulnerabilitiesPage() {
  const router = useRouter()
  // Search state removed
  const [vulnerabilities, setVulnerabilities] = useState<Mitigation[]>([])
  const [filteredVulnerabilities, setFilteredVulnerabilities] = useState<Mitigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string[]>([])
  const [localSearchQuery, setLocalSearchQuery] = useState('') // Kept local search if desired, but removed from Header props

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await graphqlQuery<GetVulnerabilitiesResponse>(
          GET_VULNERABILITIES,
          { limit: 1000 }
        )

        setVulnerabilities(response.vulnerabilities)
        setFilteredVulnerabilities(response.vulnerabilities)
      } catch (err) {
        console.error('Error fetching vulnerabilities:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch vulnerabilities')
      } finally {
        setLoading(false)
      }
    }

    fetchVulnerabilities()
  }, [])

  useEffect(() => {
    let filtered = vulnerabilities

    // Apply severity filter
    if (severityFilter.length > 0) {
      filtered = filtered.filter(vuln => 
        severityFilter.some(f => vuln.severity_rating.toLowerCase() === f.toLowerCase())
      )
    }
    
    // Note: Global search bar removed. 
    // If you want to keep filtering logic, you can add a local search bar here,
    // otherwise the filtered list just reflects the severity filters.
    
    setFilteredVulnerabilities(filtered)
  }, [severityFilter, vulnerabilities])

  const toggleSeverityFilter = (severity: string) => {
    setSeverityFilter(prev =>
      prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    )
  }

  const getSeverityColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading vulnerabilities...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-2xl font-bold">Error loading vulnerabilities</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {/* ... Rest of content ... */}
         <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vulnerabilities</h1>
          <p className="text-gray-600 mt-2">Security threats across your infrastructure</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
           {/* Severity Filters buttons ... */}
           <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Severity</h3>
           <div className="flex flex-wrap gap-2">
            {['critical', 'high', 'medium', 'low'].map((severity) => (
              <button
                key={severity}
                onClick={() => toggleSeverityFilter(severity)}
                className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                  severityFilter.includes(severity)
                    ? getSeverityColor(severity)
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
            {severityFilter.length > 0 && (
              <button
                onClick={() => setSeverityFilter([])}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            )}
           </div>
        </div>
        
        {/* Vulnerability Cards Grid ... */}
        {filteredVulnerabilities.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vulnerabilities found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVulnerabilities.map((vuln) => (
              <div key={`${vuln.cve_id}-${vuln.package}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                 {/* Card Content */}
                 <div className="flex items-start justify-between mb-3">
                   <h3 className="text-base font-semibold text-blue-600">{vuln.cve_id}</h3>
                   <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(vuln.severity_rating)}`}>{vuln.severity_rating}</span>
                 </div>
                 <p className="text-sm text-gray-700 mb-3 line-clamp-2">{vuln.summary}</p>
                 {/* ... */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}