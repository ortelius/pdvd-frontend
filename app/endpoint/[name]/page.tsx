'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import Sidebar from '@/components/Sidebar'
import { getRelativeTime } from '@/lib/dataTransform'
import { graphqlQuery, GET_ENDPOINT_DETAILS } from '@/lib/graphql'

// --- Material UI Icon Imports ---
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import NotificationsIcon from '@mui/icons-material/Notifications'
import WarningIcon from '@mui/icons-material/Warning'

interface EndpointRelease {
  release_name: string
  release_version: string
  openssf_scorecard_score?: number
  vulnerability_count: number
  vulnerability_count_delta?: number
  dependency_count: number
  last_sync: string
  vulnerabilities: Array<{
    cve_id: string
    severity_rating: string
    severity_score: number
    package: string
    affected_version: string
    fixed_in: string[]
    full_purl?: string
  }>
}

interface EndpointDetails {
  endpoint_name: string
  endpoint_url: string
  endpoint_type: string
  environment: string
  status: string
  last_sync: string
  total_vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  vulnerability_count_delta?: number
  releases: EndpointRelease[]
}

interface GetEndpointDetailsResponse {
  endpointDetails: EndpointDetails
}

export default function EndpointDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [endpoint, setEndpoint] = useState<EndpointDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const endpointName = decodeURIComponent(params.name as string)

  const [filters, setFilters] = useState({
    selectedSeverities: ['critical', 'high', 'medium', 'low', 'clean'],
    packageFilter: '',
    searchCVE: ''
  })

  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await graphqlQuery<GetEndpointDetailsResponse>(
          GET_ENDPOINT_DETAILS,
          { name: endpointName }
        )

        setEndpoint(response.endpointDetails)
      } catch (err) {
        console.error('Error fetching endpoint:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch endpoint data')
      } finally {
        setLoading(false)
      }
    }

    if (endpointName) {
      fetchEndpoint()
    }
  }, [endpointName])

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active' || statusLower === 'running') return 'bg-green-100 text-green-800'
    if (statusLower === 'inactive' || statusLower === 'stopped') return 'bg-gray-100 text-gray-800'
    if (statusLower === 'error' || statusLower === 'failed') return 'bg-red-100 text-red-800'
    if (statusLower === 'warning') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getEnvironmentColor = (environment: string) => {
    const envLower = environment.toLowerCase()
    if (envLower === 'production' || envLower === 'prod') return 'bg-red-100 text-red-800'
    if (envLower === 'staging' || envLower === 'stage') return 'bg-orange-100 text-orange-800'
    if (envLower === 'development' || envLower === 'dev') return 'bg-blue-100 text-blue-800'
    if (envLower === 'test' || envLower === 'testing') return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="flex-1 px-6 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading endpoint details...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !endpoint) {
    return (
      <>
        <Sidebar />
        <div className="flex-1 px-6 py-12">
          <h1 className="text-2xl font-bold">Endpoint not found</h1>
          <p className="mt-2 text-gray-600">{error || 'The requested endpoint could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to search
          </button>
        </div>
      </>
    )
  }

  const combinedData: Array<{
    cve_id: string
    severity: string
    score: number
    package: string
    version: string
    fixed_in: string
    release_name: string
    release_version: string
    full_purl?: string
  }> = []

  endpoint.releases?.forEach(release => {
    release.vulnerabilities
      .filter(v => filters.selectedSeverities.includes(v.severity_rating?.toLowerCase() || 'unknown'))
      .filter(v => !filters.searchCVE || v.cve_id.includes(filters.searchCVE))
      .forEach(v => {
        const packageName = v.package
        if (filters.packageFilter && !packageName.toLowerCase().includes(filters.packageFilter.toLowerCase())) {
          return
        }

        combinedData.push({
          cve_id: v.cve_id,
          severity: v.severity_rating?.toLowerCase() || 'unknown',
          score: v.severity_score ?? 0,
          package: packageName,
          version: v.affected_version || 'unknown',
          fixed_in: v.fixed_in?.join(', ') || '—',
          release_name: release.release_name,
          release_version: release.release_version,
          full_purl: v.full_purl
        })
      })
  })

  combinedData.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.package.localeCompare(b.package)
  })

  // Safe total count calculation
  const totalCount = 
    endpoint.total_vulnerabilities.critical + 
    endpoint.total_vulnerabilities.high + 
    endpoint.total_vulnerabilities.medium + 
    endpoint.total_vulnerabilities.low

  return (
    <>
      <Sidebar 
        filters={{
          vulnerabilityScore: filters.selectedSeverities,
          openssfScore: [],
          name: '',
          packageFilter: filters.packageFilter,
          searchCVE: filters.searchCVE
        }}
        setFilters={(updater: any) => {
          if (typeof updater === 'function') {
            const currentFilters = {
              vulnerabilityScore: filters.selectedSeverities,
              openssfScore: [],
              name: '',
              packageFilter: filters.packageFilter,
              searchCVE: filters.searchCVE
            }
            const newFilters = updater(currentFilters)
            setFilters({
              selectedSeverities: newFilters.vulnerabilityScore || filters.selectedSeverities,
              packageFilter: newFilters.packageFilter !== undefined ? newFilters.packageFilter : filters.packageFilter,
              searchCVE: newFilters.searchCVE !== undefined ? newFilters.searchCVE : filters.searchCVE
            })
          } else {
            setFilters({
              selectedSeverities: updater.vulnerabilityScore || filters.selectedSeverities,
              packageFilter: updater.packageFilter !== undefined ? updater.packageFilter : filters.packageFilter,
              searchCVE: updater.searchCVE !== undefined ? updater.searchCVE : filters.searchCVE
            })
          }
        }}
        selectedCategory="endpoint-detail"
      />
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
            aria-label="Go back to previous page"
          >
            <ArrowBackIcon sx={{ width: 16, height: 16 }} />
            <span className="ml-1">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{endpoint.endpoint_name}</h1>
          <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(endpoint.status)}`}>
            {endpoint.status.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded text-sm font-medium ${getEnvironmentColor(endpoint.environment)}`}>
            {endpoint.environment.toUpperCase()}
          </span>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">{endpoint.endpoint_url}</span>
            </p>
            <p className="text-sm text-gray-500">Type: {endpoint.endpoint_type}</p>
            <p className="text-sm text-gray-500">Last synced {getRelativeTime(endpoint.last_sync)}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 flex justify-center items-center gap-1">Critical</p>
              <p className="font-medium text-lg text-red-600">{endpoint.total_vulnerabilities.critical}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 flex justify-center items-center gap-1">High</p>
              <p className="font-medium text-lg text-orange-600">{endpoint.total_vulnerabilities.high}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 flex justify-center items-center gap-1">Medium</p>
              <p className="font-medium text-lg text-yellow-600">{endpoint.total_vulnerabilities.medium}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 flex justify-center items-center gap-1">Low</p>
              <p className="font-medium text-lg text-blue-600">{endpoint.total_vulnerabilities.low}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 flex justify-center items-center gap-1">Total CVEs</p>
              <p className="font-medium text-lg text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mt-6 mb-3 flex items-center gap-2">Release Versions ({endpoint.releases?.length || 0})</h3>
        <div className="overflow-auto border rounded-lg max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Release Name</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Version</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">OpenSSF Score</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Vulnerabilities</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dependencies</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Sync</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {endpoint.releases?.map((release, idx) => (
                <tr key={idx} onClick={() => router.push(`/release/${encodeURIComponent(release.release_name)}?version=${encodeURIComponent(release.release_version)}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 text-sm text-blue-600">{release.release_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{release.release_version}</td>
                  <td className="px-4 py-2 text-sm text-right">{release.openssf_scorecard_score ?? 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-right">{release.vulnerability_count}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{release.dependency_count}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{getRelativeTime(release.last_sync)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-auto border rounded-lg max-h-96 mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">CVE ID</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Score</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Release</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Release Version</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Package</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Package Version</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fixed In</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {combinedData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{row.cve_id}</td>
                  <td className="px-4 py-2 text-sm">
                    {row.severity === 'clean' ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <StarIcon sx={{ width: 12, height: 12, color: 'rgb(22, 163, 74)' }} /> CLEAN
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : row.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : row.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      } flex items-center gap-1 w-fit`}>
                        {row.severity === 'critical' ? (
                            <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'rgb(185, 28, 28)' }}>bomb</span>
                        ) : 
                          row.severity === 'high' ? <WhatshotIcon sx={{ width: 12, height: 12, color: 'rgb(194, 65, 12)' }} /> : 
                          row.severity === 'medium' ? <NotificationsIcon sx={{ width: 12, height: 12, color: 'rgb(202, 138, 4)' }} /> : 
                          <WarningIcon sx={{ width: 12, height: 12, color: 'rgb(29, 78, 216)' }} />} {row.severity.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.score}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.release_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.release_version}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.package}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.version}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.fixed_in}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}