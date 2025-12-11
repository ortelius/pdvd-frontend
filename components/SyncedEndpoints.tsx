'use client'

import { useEffect, useState, useRef } from 'react'
import { graphqlQuery, GET_AFFECTED_ENDPOINTS } from '@/lib/graphql'
import { GetAffectedEndpointsResponse, AffectedEndpoint } from '@/lib/types'
import { getRelativeTime } from '@/lib/dataTransform'

// --- Material UI Icon Imports ---
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Inventory2Icon from '@mui/icons-material/Inventory2' // Used for empty state

interface EndpointsModalProps {
  isOpen: boolean
  onClose: () => void
  releaseName: string
  releaseVersion: string
}

export default function EndpointsModal({ isOpen, onClose, releaseName, releaseVersion }: EndpointsModalProps) {
  const [endpoints, setEndpoints] = useState<AffectedEndpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref to track the last fetched parameters to prevent duplicate calls (e.g. React Strict Mode)
  const lastFetchParams = useRef<string | null>(null)

  useEffect(() => {
    // Construct a unique key for the current request parameters
    const currentParamsKey = `${releaseName}:${releaseVersion}`

    // Only fetch if open AND parameters have changed since the last successful fetch init
    if (isOpen && lastFetchParams.current !== currentParamsKey) {
      lastFetchParams.current = currentParamsKey
      fetchEndpoints()
    }

    // If modal is closed, reset the ref so it can refetch when opened again
    if (!isOpen) {
      lastFetchParams.current = null
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, releaseName, releaseVersion])

  const fetchEndpoints = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await graphqlQuery<GetAffectedEndpointsResponse>(
        GET_AFFECTED_ENDPOINTS,
        {
          name: releaseName,
          version: releaseVersion,
        }
      )

      setEndpoints(response.affectedEndpoints)
    } catch (err) {
      console.error('Error fetching endpoints:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch endpoints')
      // Reset params ref on error so user can try again
      lastFetchParams.current = null
    } finally {
      setLoading(false)
    }
  }

  // Wrapper for manual retry to manage the ref
  const handleRetry = () => {
    lastFetchParams.current = `${releaseName}:${releaseVersion}`
    fetchEndpoints()
  }

  if (!isOpen) return null

  // Helper for Status Badge Colors (matching snippet styles)
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active' || statusLower === 'running') return 'text-green-800 bg-green-100'
    if (statusLower === 'inactive' || statusLower === 'stopped') return 'text-gray-800 bg-gray-100'
    if (statusLower === 'error' || statusLower === 'failed') return 'text-red-800 bg-red-100'
    if (statusLower === 'warning') return 'text-yellow-800 bg-yellow-100'
    return 'text-blue-800 bg-blue-100'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                  Synced Endpoints
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Endpoints running {releaseName}:{releaseVersion}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading endpoints...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <ErrorOutlineIcon sx={{ color: 'rgb(248, 113, 113)' }} className="mx-auto h-12 w-12 text-red-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading endpoints</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : endpoints.length === 0 ? (
                <div className="text-center py-12">
                  <Inventory2Icon sx={{ color: 'rgb(96, 165, 250)' }} className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoints found</h3>
                  <p className="mt-1 text-sm text-gray-500">This release is not currently deployed to any endpoints</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto p-1">
                  {endpoints.map((endpoint, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col h-full"
                    >
                      {/* Top Section: Name and URL */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col flex-1">
                          <h3 className="text-base font-semibold text-blue-600 hover:underline break-words">
                            {endpoint.endpoint_name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 break-all line-clamp-1">
                            {endpoint.endpoint_url}
                          </p>
                        </div>
                      </div>

                      {/* Vulnerabilities Row */}
                      <div className="flex items-center gap-2 mb-3 mt-2">
                         <span className="text-xs font-semibold text-gray-700">Vulns:</span>
                         <div className="flex gap-1 flex-wrap">
                            {endpoint.total_vulnerabilities?.critical > 0 && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                {endpoint.total_vulnerabilities.critical} C
                              </span>
                            )}
                            {endpoint.total_vulnerabilities?.high > 0 && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                                {endpoint.total_vulnerabilities.high} H
                              </span>
                            )}
                            {endpoint.total_vulnerabilities?.medium > 0 && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                                {endpoint.total_vulnerabilities.medium} M
                              </span>
                            )}
                            {endpoint.total_vulnerabilities?.low > 0 && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                {endpoint.total_vulnerabilities.low} L
                              </span>
                            )}
                            {(endpoint.total_vulnerabilities?.critical === 0 && 
                              endpoint.total_vulnerabilities?.high === 0 && 
                              endpoint.total_vulnerabilities?.medium === 0 && 
                              endpoint.total_vulnerabilities?.low === 0) && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                0
                              </span>
                            )}
                         </div>
                      </div>

                      {/* Footer Section: Status */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Section: Sync Time */}
                      <div className="text-xs text-gray-500 mt-2">
                        Synced {getRelativeTime(endpoint.last_sync)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}