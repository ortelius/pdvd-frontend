'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import FilterSidebar from '@/components/FilterSidebar'
import {
  graphqlQuery,
  GET_AFFECTED_RELEASES,
  GET_SYNCED_ENDPOINTS,
  GET_VULNERABILITIES,
} from '@/lib/graphql'
import {
  GetAffectedReleasesResponse,
  GetSyncedEndpointsResponse,
  GetVulnerabilitiesResponse,
  ImageData,
  SyncedEndpoint,
  Mitigation,
} from '@/lib/types'
import { transformAffectedReleasesToImageData, getRelativeTime } from '@/lib/dataTransform'

// Define the allowed category types
export type SearchCategory = 'image' | 'all' | 'mitigations' | 'plugin';

interface SearchResultsProps {
  query: string
  category: SearchCategory // New prop to control the view
}

// Mock data for Mitigations
const mockMitigations: Mitigation[] = [
  {
    cve_id: 'GHSA-f82v-jwr5-mffw',
    summary: 'Authorization Bypass in Next.js Middleware',
    severity_score: 9.1,
    severity_rating: 'CRITICAL',
    package: 'pkg:npm/next',
    affected_version: '14.2.5',
    full_purl: 'pkg:npm/next@14.2.5',
    fixed_in: ['14.2.25'],
    affected_releases: 12,
    affected_endpoints: 45,
  },
  {
    cve_id: 'GHSA-gp8f-8m3g-qvj9',
    summary: 'Next.js Cache Poisoning',
    severity_score: 8.7,
    severity_rating: 'HIGH',
    package: 'pkg:npm/next',
    affected_version: '14.2.5',
    full_purl: 'pkg:npm/next@14.2.5',
    fixed_in: ['14.2.10'],
    affected_releases: 8,
    affected_endpoints: 32,
  },
  {
    cve_id: 'GHSA-7gfc-8cq8-jh5f',
    summary: 'Next.js authorization bypass vulnerability',
    severity_score: 7.5,
    severity_rating: 'HIGH',
    package: 'pkg:npm/next',
    affected_version: '14.2.5',
    full_purl: 'pkg:npm/next@14.2.5',
    fixed_in: ['14.2.15'],
    affected_releases: 15,
    affected_endpoints: 58,
  },
]

export default function SearchResults({ query, category }: SearchResultsProps) {
  const router = useRouter()
  
  const [filters, setFilters] = useState({
    vulnerabilityScore: [] as string[],
    openssfScore: [] as string[],
    name: '',
    status: [] as string[],
    environment: [] as string[],
    endpointType: [] as string[],
  })

  // Data states
  const [results, setResults] = useState<ImageData[]>([])
  const [endpointResults, setEndpointResults] = useState<SyncedEndpoint[]>([])
  const [vulnerabilityResults, setVulnerabilityResults] = useState<Mitigation[]>([])
  const [mockMitigationList, setMockMitigationList] = useState<Mitigation[]>([])

  // Loading and Error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track which data has been fetched to avoid refetching
  const [fetchedCategories, setFetchedCategories] = useState<Set<string>>(new Set())

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Mitigations List View states
  const [selectedMitigations, setSelectedMitigations] = useState<Set<string>>(new Set())
  const [showActionMenu, setShowActionMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch data when category changes
  useEffect(() => {
    const fetchDataForCategory = async () => {
      // If we've already fetched this category, skip (unless you want to support refetching)
      if (fetchedCategories.has(category)) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        switch (category) {
          case 'all': // Project Releases
            const releasesResponse = await graphqlQuery<GetAffectedReleasesResponse>(
              GET_AFFECTED_RELEASES,
              { severity: 'NONE', limit: 1000 }
            )
            const imageData = transformAffectedReleasesToImageData(releasesResponse.affectedReleases)
            setResults(imageData)
            break

          case 'image': // Synced Endpoints
            const endpointsResponse = await graphqlQuery<GetSyncedEndpointsResponse>(
              GET_SYNCED_ENDPOINTS,
              { limit: 1000 }
            )
            setEndpointResults(endpointsResponse.syncedEndpoints)
            break

          case 'plugin': // Vulnerabilities
            const vulnerabilitiesResponse = await graphqlQuery<GetVulnerabilitiesResponse>(
              GET_VULNERABILITIES, 
              { limit: 1000 }
            )
            setVulnerabilityResults(vulnerabilitiesResponse.vulnerabilities)
            break

          case 'mitigations': // Mitigations
            setMockMitigationList(mockMitigations)
            break
        }

        setFetchedCategories(prev => new Set(prev).add(category))
      } catch (err) {
        console.error(`Error fetching ${category} data:`, err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchDataForCategory()
  }, [category, fetchedCategories])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedMitigations(new Set())
    setShowActionMenu(false)
  }, [query, filters, category])

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActionMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMitigation = (cveId: string) => {
    const newSelected = new Set(selectedMitigations)
    if (newSelected.has(cveId)) {
      newSelected.delete(cveId)
    } else {
      newSelected.add(cveId)
    }
    setSelectedMitigations(newSelected)
  }

  const toggleAll = () => {
    const allFilteredMitigations = getFilteredData() as Mitigation[]
    if (selectedMitigations.size === allFilteredMitigations.length) {
      setSelectedMitigations(new Set())
    } else {
      setSelectedMitigations(new Set(allFilteredMitigations.map(m => m.cve_id)))
    }
  }

  const handleAction = (action: string) => {
    setShowActionMenu(false)
    alert(`Successfully created ${selectedMitigations.size} ${action}(s)`)
  }

  const handleTakeAction = () => {
    if (selectedMitigations.size > 0) {
      setShowActionMenu(!showActionMenu)
    }
  }

  const getFilteredData = () => {
    const queryLower = query.toLowerCase()
    const nameLower = filters.name.toLowerCase()

    // Synced Endpoints
    if (category === 'image') {
      return endpointResults.filter(endpoint => {
        if (query && !endpoint.endpoint_name.toLowerCase().includes(queryLower) && !endpoint.endpoint_url.toLowerCase().includes(queryLower)) return false
        if (filters.name && !endpoint.endpoint_name.toLowerCase().includes(nameLower)) return false
        if (filters.status && filters.status.length > 0 && !filters.status.some(s => endpoint.status.toLowerCase() === s.toLowerCase())) return false
        if (filters.environment && filters.environment.length > 0 && !filters.environment.some(e => endpoint.environment.toLowerCase() === e.toLowerCase())) return false
        if (filters.endpointType && filters.endpointType.length > 0 && !filters.endpointType.some(t => endpoint.endpoint_type.toLowerCase() === t.toLowerCase())) return false
        if (filters.vulnerabilityScore.length > 0) {
          const hasNoVulnerabilities = endpoint.total_vulnerabilities.critical === 0 && endpoint.total_vulnerabilities.high === 0 && endpoint.total_vulnerabilities.medium === 0 && endpoint.total_vulnerabilities.low === 0
          const matchesFilter = filters.vulnerabilityScore.some(filter => {
            if (filter === 'clean') return hasNoVulnerabilities
            if (filter === 'critical') return endpoint.total_vulnerabilities.critical > 0
            if (filter === 'high') return endpoint.total_vulnerabilities.high > 0
            if (filter === 'medium') return endpoint.total_vulnerabilities.medium > 0
            if (filter === 'low') return endpoint.total_vulnerabilities.low > 0
            return false
          })
          if (!matchesFilter) return false
        }
        return true
      })
    }

    // Vulnerabilities
    if (category === 'plugin') {
      return vulnerabilityResults.filter(vuln => {
        if (query && !vuln.cve_id.toLowerCase().includes(queryLower) && !vuln.summary.toLowerCase().includes(queryLower)) return false
        if (filters.name && !vuln.cve_id.toLowerCase().includes(nameLower)) return false
        if (filters.vulnerabilityScore.length > 0) {
          if (filters.vulnerabilityScore.includes('clean') && filters.vulnerabilityScore.length === 1) return false
          const severities = filters.vulnerabilityScore.filter(f => f !== 'clean')
          if (severities.length > 0 && !severities.some(f => vuln.severity_rating.toLowerCase() === f.toLowerCase())) return false
        }
        return true
      })
    }

    // Mitigations
    if (category === 'mitigations') {
      return mockMitigationList.filter(mit => {
        if (query && !mit.cve_id.toLowerCase().includes(queryLower) && !mit.summary.toLowerCase().includes(queryLower)) return false
        if (filters.name && !mit.cve_id.toLowerCase().includes(nameLower)) return false
        if (filters.vulnerabilityScore.length > 0) {
          if (filters.vulnerabilityScore.includes('clean')) return false
          if (!filters.vulnerabilityScore.some(f => mit.severity_rating.toLowerCase() === f.toLowerCase())) return false
        }
        return true
      })
    }

    // Project Releases (default / 'all')
    return results.filter(result => {
      if (query && !result.name.toLowerCase().includes(queryLower) && !result.description.toLowerCase().includes(queryLower)) return false
      if (filters.name && !result.name.toLowerCase().includes(nameLower)) return false
      if (filters.vulnerabilityScore.length > 0) {
        const hasNoVulnerabilities = result.vulnerabilities.critical === 0 && result.vulnerabilities.high === 0 && result.vulnerabilities.medium === 0 && result.vulnerabilities.low === 0
        const matchesFilter = filters.vulnerabilityScore.some(filter => {
          if (filter === 'clean') return hasNoVulnerabilities
          if (filter === 'critical') return result.vulnerabilities.critical > 0
          if (filter === 'high') return result.vulnerabilities.high > 0
          if (filter === 'medium') return result.vulnerabilities.medium > 0
          if (filter === 'low') return result.vulnerabilities.low > 0
          return false
        })
        if (!matchesFilter) return false
      }
      if (filters.openssfScore.length > 0) {
        const matchesFilter = filters.openssfScore.some(filter => {
          if (filter === 'high') return result.openssfScore >= 8.0
          if (filter === 'medium') return result.openssfScore >= 6.0 && result.openssfScore < 8.0
          if (filter === 'low') return result.openssfScore < 6.0
          return false
        })
        if (!matchesFilter) return false
      }
      return true
    })
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const handleCardClick = (item: any) => {
    if (category === 'image') {
      const endpoint = item as SyncedEndpoint
      router.push(`/endpoint/${encodeURIComponent(endpoint.endpoint_name)}`)
    } else if (category === 'all') {
      const release = item as ImageData
      router.push(`/release/${encodeURIComponent(release.name)}?version=${encodeURIComponent(release.version)}`)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getSeverityColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryTitle = () => {
    if (category === 'image') return 'Synced Endpoints'
    if (category === 'all') return 'Project Releases'
    if (category === 'plugin') return 'Vulnerabilities'
    if (category === 'mitigations') return 'Mitigations'
    return 'Results'
  }

  if (loading) {
    return (
      <div className="px-6 py-6">
        <div className="flex gap-6">
          <FilterSidebar filters={filters} setFilters={setFilters} selectedCategory={category} />
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading {getCategoryTitle().toLowerCase()}...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-6">
        <div className="flex gap-6">
          <FilterSidebar filters={filters} setFilters={setFilters} selectedCategory={category} />
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading data</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={() => {
                  setFetchedCategories(new Set()) // Clear cache to trigger refetch
                  // Force a re-render or refetch by clearing and setting back category logic if needed, 
                  // but simplest is just refreshing page or calling a reload function.
                  window.location.reload()
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6">
      <div className="flex gap-6">
        <FilterSidebar filters={filters} setFilters={setFilters} selectedCategory={category} />

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {query ? `Search results for "${query}"` : getCategoryTitle()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredData.length.toLocaleString()} results
                {filteredData.length > itemsPerPage && category !== 'mitigations' && (
                  <span className="text-gray-400"> • Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span>
                )}
              </p>
            </div>

            {category !== 'mitigations' && (
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Per page:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>
            )}
          </div>

          {/* Render Mitigations Action Bar */}
          {category === 'mitigations' && (
            <div className="mb-4 bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMitigations.size === filteredData.length && filteredData.length > 0}
                      onChange={toggleAll}
                      disabled={filteredData.length === 0}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Select all ({filteredData.length})</span>
                  </label>
                  {selectedMitigations.size > 0 && (
                    <span className="text-sm text-gray-600">{selectedMitigations.size} selected</span>
                  )}
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleTakeAction}
                    disabled={selectedMitigations.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Take Action
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showActionMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                      <button onClick={() => handleAction('AI Auto-remediation')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                        <span className="font-medium text-gray-900">AI Auto-remediation</span>
                      </button>
                      <button onClick={() => handleAction('Jira Issue')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                        <span className="font-medium text-gray-900">Create Jira Issue</span>
                      </button>
                      {/* ... other actions ... */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* --- Synced Endpoints (category='image') --- */}
                {category === 'image' && (paginatedData as SyncedEndpoint[]).map((endpoint, index) => (
                  <div key={index} onClick={() => handleCardClick(endpoint)} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-blue-600 hover:underline break-words">{endpoint.endpoint_name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{endpoint.endpoint_url}</p>
                      </div>
                    </div>
                    {/* ... (Status, Vulnerabilities stats rendering) ... */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${endpoint.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{endpoint.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Synced {getRelativeTime(endpoint.last_sync)}</div>
                  </div>
                ))}

                {/* --- Vulnerabilities (category='plugin') --- */}
                {category === 'plugin' && (paginatedData as Mitigation[]).map(vuln => (
                  <div key={`${vuln.cve_id}-${vuln.package}`} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-blue-600">{vuln.cve_id}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(vuln.severity_rating)}`}>{vuln.severity_rating.toUpperCase()} {vuln.severity_score.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{vuln.summary}</p>
                    <div className="space-y-2 text-xs text-gray-600 mb-3">
                      <div><span className="font-medium">Package:</span> <span className="break-all">{vuln.package}</span></div>
                    </div>
                  </div>
                ))}

                {/* --- Mitigations (category='mitigations') --- */}
                {category === 'mitigations' && (paginatedData as Mitigation[]).map(mit => (
                  <div key={`${mit.cve_id}-${mit.package}`} onClick={() => toggleMitigation(mit.cve_id)} className={`border rounded-lg p-4 transition-all bg-white cursor-pointer ${selectedMitigations.has(mit.cve_id) ? 'bg-blue-50 border-blue-400 shadow-md' : 'border-gray-200 hover:border-gray-400 hover:shadow-md'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedMitigations.has(mit.cve_id)} onChange={(e) => { e.stopPropagation(); toggleMitigation(mit.cve_id) }} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <h3 className="text-base font-semibold text-blue-600">{mit.cve_id}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(mit.severity_rating)}`}>{mit.severity_rating.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{mit.summary}</p>
                  </div>
                ))}

                {/* --- Project Releases (category='all') --- */}
                {category === 'all' && (paginatedData as ImageData[]).map((result, index) => (
                  <div key={index} onClick={() => handleCardClick(result)} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-blue-600 hover:underline break-words">{result.name}</h3>
                          <span className="text-sm text-gray-500 font-normal">{result.version}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-700">Vulnerabilities:</span>
                      {/* ... (Vulnerability chips) ... */}
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold">{result.total_vulnerabilities}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <span>Updated {result.updated}</span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <span key={index} className={`px-3 py-1 ${page === currentPage ? 'font-bold' : ''}`}>{page}</span>
                    ))}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}