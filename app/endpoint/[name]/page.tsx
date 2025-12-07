'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import Header from '@/components/Header'
import { getRelativeTime } from '@/lib/dataTransform'
import { graphqlQuery, GET_ENDPOINT_DETAILS } from '@/lib/graphql'

// Material UI Icon Imports
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import StarIcon from '@mui/icons-material/Star'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [endpoint, setEndpoint] = useState<EndpointDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  const endpointName = decodeURIComponent(params.name as string)

  // Filter state
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['critical', 'high', 'medium', 'low', 'clean'])
  const [packageFilter, setPackageFilter] = useState('')
  const [searchCVE, setSearchCVE] = useState('')

  const handleSearch = () => {
    router.push('/')
  }

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
      <div className="min-h-screen bg-white">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading endpoint details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !endpoint) {
    return (
      <div className="min-h-screen bg-white">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-2xl font-bold">Endpoint not found</h1>
          <p className="mt-2 text-gray-600">{error || 'The requested endpoint could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to search
          </button>
        </div>
      </div>
    )
  }

  // Process data for CVE/Package table (combining all releases)
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

  // Add vulnerable packages from all releases
  endpoint.releases.forEach(release => {
    release.vulnerabilities
      .filter(v => selectedSeverities.includes(v.severity_rating?.toLowerCase() || 'unknown'))
      .filter(v => !searchCVE || v.cve_id.includes(searchCVE))
      .forEach(v => {
        const packageName = v.package
        if (packageFilter && !packageName.toLowerCase().includes(packageFilter.toLowerCase())) {
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

  // Sort by score (highest first), then by package name
  combinedData.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.package.localeCompare(b.package)
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />

      <div className={`px-6 py-6 flex ${isSidebarOpen ? 'gap-6' : 'gap-2'}`}>
        
        <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-64' : 'w-12'}`}>
          
          <div className="sticky top-20"> 

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              
              <div className={`flex items-center justify-between mb-4 ${isSidebarOpen ? '' : 'justify-center'}`}>
                  {isSidebarOpen ? (
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <SettingsIcon sx={{ width: 20, height: 20, color: 'rgb(37, 99, 235)' }} /> 
                          Filters
                      </h3>
                  ) : (
                      <SettingsIcon sx={{ width: 20, height: 20, color: 'rgb(37, 99, 235)' }} />
                  )}
                  
                  <button 
                      onClick={() => setIsSidebarOpen(prev => !prev)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label={isSidebarOpen ? "Collapse Filters" : "Expand Filters"}
                  >
                      {isSidebarOpen ? (
                          <ChevronLeftIcon sx={{ width: 20, height: 20 }} />
                      ) : (
                          <ChevronRightIcon sx={{ width: 20, height: 20 }} />
                      )}
                  </button>
              </div>

              <div className={`transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
                  
                  {(selectedSeverities.length < 5 || packageFilter || searchCVE) && (
                      <div className="flex justify-end mb-4">
                          <button
                              onClick={() => {
                                  setSelectedSeverities(['critical', 'high', 'medium', 'low', 'clean'])
                                  setPackageFilter('')
                                  setSearchCVE('')
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                              Clear all
                          </button>
                      </div>
                  )}

                  <div className="mb-6"> 
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <SecurityIcon sx={{ width: 16, height: 16, color: 'rgb(22, 163, 74)' }} /> 
                          Severity
                      </h4>
                      <div className="space-y-2">
                          {['critical', 'high', 'medium', 'low', 'clean'].map(level => (
                              <label key={level} className="flex items-center cursor-pointer group">
                                  <input
                                      type="checkbox"
                                      checked={selectedSeverities.includes(level)}
                                      onChange={() => {
                                          setSelectedSeverities(prev =>
                                              prev.includes(level) ? prev.filter(s => s !== level) : [...prev, level]
                                          )
                                      }}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                                      {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </span>
                              </label>
                          ))}
                      </div>
                  </div>

                  <div className="mb-6"> 
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Inventory2Icon sx={{ width: 16, height: 16, color: 'rgb(59, 130, 246)' }} /> 
                          Package
                      </h4>
                      <input
                          type="text"
                          className="w-[98%] mx-auto px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block"
                          value={packageFilter}
                          onChange={e => setPackageFilter(e.target.value)}
                          placeholder="Filter by package name..."
                      />
                  </div>

                  <div className="mb-6"> 
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span 
                              className="material-symbols-outlined" 
                              style={{ 
                                  fontSize: '20px', 
                                  color: 'rgb(185, 28, 28)',
                                  lineHeight: '1'
                              }}>
                              threat_intelligence
                          </span>
                          CVE ID
                      </h4>
                      <input
                          type="text"
                          className="w-[98%] mx-auto px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block"
                          value={searchCVE}
                          onChange={e => setSearchCVE(e.target.value)}
                          placeholder="Filter by CVE ID..."
                      />
                  </div>
              </div>

            </div>
          </div>

        </aside>

        <main className="flex-1 space-y-6">
          
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
                <p className="text-xs text-gray-600 flex justify-center items-center gap-1">
                  <span 
                      className="material-symbols-outlined" 
                      style={{ 
                          fontSize: '20px', 
                          color: 'rgb(185, 28, 28)',
                          lineHeight: '1'
                      }}>
                      threat_intelligence
                  </span>
                  Critical
                </p>
                <p className="font-medium text-lg text-red-600">{endpoint.total_vulnerabilities.critical}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 flex justify-center items-center gap-1">
                  <span 
                      className="material-symbols-outlined" 
                      style={{ 
                          fontSize: '20px', 
                          color: 'rgb(234, 88, 12)',
                          lineHeight: '1'
                      }}>
                      threat_intelligence
                  </span>
                  High
                </p>
                <p className="font-medium text-lg text-orange-600">{endpoint.total_vulnerabilities.high}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 flex justify-center items-center gap-1">
                  <span 
                      className="material-symbols-outlined" 
                      style={{ 
                          fontSize: '20px', 
                          color: 'rgb(202, 138, 4)',
                          lineHeight: '1'
                      }}>
                      threat_intelligence
                  </span>
                  Medium
                </p>
                <p className="font-medium text-lg text-yellow-600">{endpoint.total_vulnerabilities.medium}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 flex justify-center items-center gap-1">
                  <span 
                      className="material-symbols-outlined" 
                      style={{ 
                          fontSize: '20px', 
                          color: 'rgb(37, 99, 235)',
                          lineHeight: '1'
                      }}>
                      threat_intelligence
                  </span>
                  Low
                </p>
                <p className="font-medium text-lg text-blue-600">{endpoint.total_vulnerabilities.low}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 flex justify-center items-center gap-1">
                  <span 
                      className="material-symbols-outlined" 
                      style={{ 
                          fontSize: '20px', 
                          color: 'rgb(107, 114, 128)',
                          lineHeight: '1'
                      }}>
                      threat_intelligence
                  </span>
                  Total CVEs
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-medium text-lg text-gray-900">
                    {endpoint.total_vulnerabilities.critical + 
                     endpoint.total_vulnerabilities.high + 
                     endpoint.total_vulnerabilities.medium + 
                     endpoint.total_vulnerabilities.low}
                  </p>
                  {endpoint.vulnerability_count_delta !== undefined && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded text-xs">
                      {endpoint.vulnerability_count_delta > 0 ? (
                        <>
                          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                          <span className="font-bold text-red-600">{Math.abs(endpoint.vulnerability_count_delta)}</span>
                        </>
                      ) : endpoint.vulnerability_count_delta < 0 ? (
                        <>
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          <span className="font-bold text-green-600">{Math.abs(endpoint.vulnerability_count_delta)}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                          <span className="font-bold text-blue-600">0</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

<section className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Inventory2Icon sx={{ width: 20, height: 20, color: 'rgb(37, 99, 235)' }} /> 
              Release Versions ({endpoint.releases.length})
            </h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Release Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Version</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">OpenSSF Score</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Vulnerabilities</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Dependencies</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.releases.length > 0 ? (
                    endpoint.releases.map((release, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/release/${encodeURIComponent(release.release_name)}?version=${encodeURIComponent(release.release_version)}`)}
                      >
                        <td className="px-4 py-2 align-top whitespace-normal text-sm text-blue-600 hover:text-blue-800">
                          {release.release_name}
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap text-sm text-gray-700">
                          {release.release_version}
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap text-sm text-right">
                          <span className={`font-bold ${
                            release.openssf_scorecard_score != null 
                              ? release.openssf_scorecard_score >= 8 ? 'text-green-600' 
                                : release.openssf_scorecard_score >= 6 ? 'text-yellow-600' 
                                : 'text-red-600'
                              : 'text-gray-400'
                          }`}>
                            {release.openssf_scorecard_score != null ? release.openssf_scorecard_score.toFixed(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap text-sm text-gray-700 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span>{release.vulnerability_count}</span>
                            {release.vulnerability_count_delta !== undefined && (
                              <div className="flex items-center gap-1 px-1 py-0.5 bg-gray-50 rounded text-xs">
                                {release.vulnerability_count_delta > 0 ? (
                                  <>
                                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    <span className="font-bold text-red-600">{Math.abs(release.vulnerability_count_delta)}</span>
                                  </>
                                ) : release.vulnerability_count_delta < 0 ? (
                                  <>
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    <span className="font-bold text-green-600">{Math.abs(release.vulnerability_count_delta)}</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" /></svg>
                                    <span className="font-bold text-blue-600">0</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap text-sm text-gray-700">
                          {release.dependency_count}
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap text-sm text-gray-700">
                          {getRelativeTime(release.last_sync)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center bg-white">
                        <p className="text-gray-500 font-medium text-lg">No releases found for this endpoint.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="overflow-auto border rounded-lg max-h-96"> 
            {combinedData.length > 0 ? (
              <table className="w-full table-auto min-w-[1000px]">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">CVE ID</th>
                    <th className="px-4 py-2 text-left border-b">Severity</th>
                    <th className="px-4 py-2 text-left border-b">Score</th>
                    <th className="px-4 py-2 text-left border-b">Release</th>
                    <th className="px-4 py-2 text-left border-b">Release Version</th>
                    <th className="px-4 py-2 text-left border-b">Package</th>
                    <th className="px-4 py-2 text-left border-b">Package Version</th>
                    <th className="px-4 py-2 text-left border-b">Fixed In</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{row.cve_id}</td>
                      <td className="px-4 py-2">
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
                              <span className="material-symbols-outlined" style={{ 
                                  fontSize: '12px', 
                                  width: '12px', 
                                  height: '12px', 
                                  color: 'rgb(185, 28, 28)',
                                  lineHeight: '1', 
                                  marginRight: '4px'
                              }}>
                                  bomb
                              </span>
                          ) : 
                           row.severity === 'high' ? <WhatshotIcon sx={{ width: 12, height: 12, color: 'rgb(194, 65, 12)' }} /> : 
                           row.severity === 'medium' ? <NotificationsIcon sx={{ width: 12, height: 12, color: 'rgb(202, 138, 4)' }} /> : 
                           <WarningIcon sx={{ width: 12, height: 12, color: 'rgb(29, 78, 216)' }} />} {row.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2">{row.score}</td>
                      <td className="px-4 py-2">
                        <span 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => router.push(`/release/${encodeURIComponent(row.release_name)}?version=${encodeURIComponent(row.release_version)}`)}
                        >
                          {row.release_name}
                        </span>
                      </td>
                      <td className="px-4 py-2">{row.release_version}</td>
                      <td className="px-4 py-2">{row.package}</td>
                      <td className="px-4 py-2">{row.version}</td>
                      <td className="px-4 py-2">{row.fixed_in}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full table-auto min-w-[1000px]">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">CVE ID</th>
                    <th className="px-4 py-2 text-left border-b">Severity</th>
                    <th className="px-4 py-2 text-left border-b">Score</th>
                    <th className="px-4 py-2 text-left border-b">Release</th>
                    <th className="px-4 py-2 text-left border-b">Release Version</th>
                    <th className="px-4 py-2 text-left border-b">Package</th>
                    <th className="px-4 py-2 text-left border-b">Package Version</th>
                    <th className="px-4 py-2 text-left border-b">Fixed In</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center bg-white">
                      <p className="text-gray-500 font-medium text-lg">No data found matching current filters.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}