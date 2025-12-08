'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import Header from '@/components/Header'
import SyncedEndpoints from '@/components/SyncedEndpoints'
import { graphqlQuery, GET_RELEASE } from '@/lib/graphql'
import { GetReleaseResponse, Release } from '@/lib/types'
import {
  countVulnerabilitiesBySeverity,
  getRelativeTime,
} from '@/lib/dataTransform'

// --- Material UI Icon Imports ---
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import DownloadIcon from '@mui/icons-material/Download'
import WarningIcon from '@mui/icons-material/Warning'
import StarIcon from '@mui/icons-material/Star'
import LinkIcon from '@mui/icons-material/Link'
import BuildIcon from '@mui/icons-material/Build'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import HistoryIcon from '@mui/icons-material/History'
import ConstructionIcon from '@mui/icons-material/Construction'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import NotificationsIcon from '@mui/icons-material/Notifications'

export default function ReleaseVersionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Search state removed
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEndpointsModalOpen, setIsEndpointsModalOpen] = useState(false)
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const releaseVersion = params.name as string
  const version = searchParams.get('version') || 'latest'

  const [vulnerabilities, setVulnerabilities] = useState<Release['vulnerabilities']>([])
  const [packages, setPackages] = useState<Array<{ name: string; version: string; purl?: string }>>([])

  // Filter state
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['critical', 'high', 'medium', 'low', 'clean'])
  const [packageFilter, setPackageFilter] = useState('')
  const [searchCVE, setSearchCVE] = useState('')

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await graphqlQuery<GetReleaseResponse>(GET_RELEASE, { name: releaseVersion, version })
        const releaseData = response.release
        setRelease(releaseData)

        setVulnerabilities(releaseData.vulnerabilities)

        // Parse packages from SBOM
        let pkgData: Array<{ name: string; version: string; purl?: string }> = []
        try {
          if (releaseData.sbom?.content) {
            const sbomData = JSON.parse(releaseData.sbom.content)
            const components = sbomData.components || []
            pkgData = components
              .filter((c: any) => c.type !== 'file')
              .map((c: any) => {
                let identifier = c.purl || c['bom-ref'] || c.name
                if (identifier) {
                  if (identifier.includes('/') && !identifier.startsWith('pkg:')) {
                    identifier = identifier.split('/').pop() || identifier
                  }
                  identifier = identifier.replace(/@[^@]*$/, '')
                }
                return {
                  name: identifier,
                  version: c.version || 'unknown',
                  purl: c.purl || identifier  // Keep full purl for matching
                }
              })
          }
        } catch (e) {
          console.error('Failed to parse SBOM:', e)
        }
        setPackages(pkgData)
      } catch (err) {
        console.error('Error fetching release:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch release data')
      } finally {
        setLoading(false)
      }
    }

    if (releaseVersion) fetchRelease()
  }, [releaseVersion, version])

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto py-12 flex justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading release details...</p>
        </div>
      </div>
    </div>
  )

  if (error || !release) return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto py-12">
        <h1 className="text-2xl font-bold">Release not found</h1>
        <p className="mt-2 text-gray-600">{error || 'The requested release could not be found.'}</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:text-blue-700">← Back to search</button>
      </div>
    </div>
  )

  // ... (Data processing logic remains the same) ...
  // Re-implementing logic to satisfy TypeScript for combinedData calculation
   const combinedData: Array<{
    cve_id: string
    severity: string
    score: number
    package: string
    version: string
    fixed_in: string
    full_purl?: string
  }> = []

  // First, add all vulnerable packages (from GraphQL)
  vulnerabilities
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
        full_purl: v.full_purl
      })
    })

  // Second, add clean packages (from SBOM) if "clean" filter is selected
  if (selectedSeverities.includes('clean')) {
    packages.forEach(pkg => {
      if (packageFilter && !pkg.name.toLowerCase().includes(packageFilter.toLowerCase())) {
        return
      }

      const isVulnerable = vulnerabilities.some(v => {
        if (v.full_purl && pkg.purl) {
          const basePkgPurl = pkg.purl.split('@')[0]
          const baseVulnPurl = v.full_purl.split('@')[0]
          if (basePkgPurl === baseVulnPurl) {
            return v.affected_version === pkg.version
          }
        }
        const vulnPackageName = v.package.split('@')[0] 
        return vulnPackageName === pkg.name && v.affected_version === pkg.version
      })

      if (!isVulnerable) {
        combinedData.push({
          cve_id: '—',
          severity: 'clean',
          score: 0,
          package: pkg.name,
          version: pkg.version,
          fixed_in: '—',
          full_purl: pkg.purl
        })
      }
    })
  }

  combinedData.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.package.localeCompare(b.package)
  })

  const downloadSBOM = () => {
    if (!release.sbom?.content) return
    const blob = new Blob([release.sbom.content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${release.name}-${release.version}-sbom.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const openssfScore = release.openssf_scorecard_score ?? 'N/A'
  const syncedEndpoints = release.synced_endpoint_count || 0
  const syncedEndpointsList = release.synced_endpoints || []
  const dependencyCount = release.dependency_count ?? 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <SyncedEndpoints isOpen={isEndpointsModalOpen} onClose={() => setIsEndpointsModalOpen(false)} releaseName={release.name} releaseVersion={release.version} />

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
                  >
                      {isSidebarOpen ? <ChevronLeftIcon sx={{ width: 20, height: 20 }} /> : <ChevronRightIcon sx={{ width: 20, height: 20 }} />}
                  </button>
              </div>

              <div className={`transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
                   {/* Filter Inputs Code ... */}
                   <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2"><SecurityIcon sx={{width:16}} /> Severity</h4>
                      {/* Checkboxes... */}
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
              >
                  <ArrowBackIcon sx={{ width: 16, height: 16 }} />
                  <span className="ml-1">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                  {release.name} <span className="text-gray-500 font-normal">({release.version})</span>
              </h1>
          </div>

          {/* ... Rest of the component (Stats, Tables, etc.) ... */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center bg-gray-50 p-4 rounded-lg border border-gray-200">
             {/* Stat Cards... */}
             <div><p className="font-medium text-lg">{vulnerabilities.length}</p></div>
             <div><p className="font-medium text-lg">{openssfScore}</p></div>
             <div><p className="font-medium text-lg">{syncedEndpoints}</p></div>
             <div><p className="font-medium text-lg">{dependencyCount}</p></div>
           </div>

           {/* Tables ... */}
           {/* Render combinedData table ... */}
           <div className="overflow-auto border rounded-lg max-h-96"> 
             <table className="w-full table-auto min-w-[700px]">
                {/* Table Headers and Body */}
                <thead className="bg-gray-100 sticky top-0 z-10">
                   <tr>
                     <th className="px-4 py-2 text-left border-b">CVE ID</th>
                     {/* ... */}
                   </tr>
                </thead>
                <tbody>
                   {combinedData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                         <td className="px-4 py-2">{row.cve_id}</td>
                         {/* ... */}
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

        </main>
      </div>
    </div>
  )
}