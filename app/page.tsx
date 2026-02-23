'use client' 

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { graphqlQuery, GET_ORG_AGGREGATED_RELEASES } from '@/lib/graphql'
import { GetOrgAggregatedReleasesResponse, OrgAggregatedRelease } from '@/lib/types'
import { useOrg } from '@/context/OrgContext'
import { useAuth } from '@/context/AuthContext'
import MainLayoutWrapper from '@/components/MainLayoutWrapper'

// Icons
import BusinessIcon from '@mui/icons-material/Business'
import SecurityIcon from '@mui/icons-material/Security'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import HubIcon from '@mui/icons-material/Hub'

export default function ProjectsPage() {
  const router = useRouter()
  const { setSelectedOrg } = useOrg()
  const { user } = useAuth()
  const [data, setData] = useState<OrgAggregatedRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await graphqlQuery<GetOrgAggregatedReleasesResponse>(
          GET_ORG_AGGREGATED_RELEASES,
          { severity: 'NONE' }
        )
        setData(response.orgAggregatedReleases)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [user])

  const handleOrgClick = (orgName: string) => {
    setSelectedOrg(orgName)
    router.push('/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0d1117] w-full">
      <Sidebar />
      <MainLayoutWrapper>
        <div className="flex-1 px-6 py-6 bg-gray-50 dark:bg-[#0d1117] min-h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f0f6fc]">Organizations</h1>
            <p className="text-gray-600 dark:text-[#8b949e] mt-2">Select an organization to view vulnerability details</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-[#58a6ff]"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-[rgba(248,81,73,0.1)] text-red-800 dark:text-[#ff8a8a] rounded-lg border border-red-200 dark:border-[rgba(248,81,73,0.3)]">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] border-dashed">
              <BusinessIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-[#30363d]" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-[#e6edf3]">No organizations found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
                You are not associated with any organizations that have visible releases.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {data.map((org, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOrgClick(org.org_name)}
                  className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm p-6 hover:shadow-md dark:hover:border-[#58a6ff] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-[rgba(56,139,253,0.15)] rounded-lg text-blue-600 dark:text-[#58a6ff]">
                        <BusinessIcon />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-[#f0f6fc] text-lg">{org.org_name || 'Library'}</h3>
                        <p className="text-sm text-gray-500 dark:text-[#8b949e]">{org.total_releases} Releases</p>
                      </div>
                    </div>
                    {org.avg_scorecard_score !== undefined && org.avg_scorecard_score !== null && (
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#21262d] px-2 py-1 rounded border border-gray-100 dark:border-[#30363d]">
                        <SecurityIcon sx={{ fontSize: 16 }} className="text-green-600 dark:text-[#7ee787]" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">{org.avg_scorecard_score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase mb-2">Vulnerabilities</p>
                      <div className="flex flex-wrap gap-2">
                        {org.critical_count > 0 && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-[rgba(248,81,73,0.2)] text-red-800 dark:text-[#ffb1b1] rounded text-xs font-bold">
                            {org.critical_count} Critical
                          </span>
                        )}
                        {org.high_count > 0 && (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-[rgba(219,109,40,0.2)] text-orange-800 dark:text-[#ffc79b] rounded text-xs font-bold">
                            {org.high_count} High
                          </span>
                        )}
                        {org.medium_count > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-[rgba(187,128,9,0.2)] text-yellow-800 dark:text-[#ffd87f] rounded text-xs font-bold">
                            {org.medium_count} Med
                          </span>
                        )}
                        {org.low_count > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-[rgba(56,139,253,0.2)] text-blue-800 dark:text-[#79c0ff] rounded text-xs font-bold">
                            {org.low_count} Low
                          </span>
                        )}
                        {org.total_vulnerabilities === 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-[rgba(46,160,67,0.2)] text-green-800 dark:text-[#7ee787] rounded text-xs font-bold">
                            Clean
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-[#30363d]">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8b949e] mb-1">
                          <HubIcon sx={{ fontSize: 14 }} />
                          Synced Endpoints
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">{org.synced_endpoint_count}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8b949e] mb-1">
                          <Inventory2Icon sx={{ fontSize: 14 }} />
                          Dependencies
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">{org.total_dependencies}</p>
                      </div>
                    </div>

                    {org.vulnerability_count_delta !== null && org.vulnerability_count_delta !== undefined && org.vulnerability_count_delta !== 0 && (
                      <div className="pt-2">
                        <span className={`text-xs font-medium ${org.vulnerability_count_delta > 0 ? 'text-red-600 dark:text-[#ff8a8a]' : 'text-green-600 dark:text-[#7ee787]'}`}>
                          {org.vulnerability_count_delta > 0 ? '↑' : '↓'} {Math.abs(org.vulnerability_count_delta)} new vulnerabilities
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainLayoutWrapper>
    </div>
  )
}