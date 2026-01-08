'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useSidebar } from '@/context/SidebarContext'
import { useOrg } from '@/context/OrgContext'

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BuildIcon from '@mui/icons-material/Build'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { ThreatIntelligence } from '@/components/icons'

export default function TopNavigation() {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const { selectedOrg } = useOrg()

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname === path
  }

  // Only show these nav items if an org is selected
  const contextNavItems = selectedOrg ? [
    { label: 'Dashboard', icon: DashboardIcon, path: '/' },
    { label: 'Endpoints', icon: HubIcon, path: '/endpoints' },
    { label: 'Releases', icon: Inventory2Icon, path: '/releases' },
    { label: 'Mitigations', icon: BuildIcon, path: '/mitigations' },
    { label: 'Vulnerabilities', icon: ThreatIntelligence, path: '/vulnerabilities' },
  ] : [
    { label: 'Dashboard', icon: DashboardIcon, path: '/' },
  ]

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Ortelius', path: '/' }]

    // Add selected org to breadcrumb if exists
    if (selectedOrg && pathname !== '/projects') {
      breadcrumbs.push({ label: selectedOrg, path: '/projects' })
    }

    let currentPath = ''
    paths.forEach((segment) => {
      currentPath += `/${segment}`
      
      const decodedSegment = decodeURIComponent(segment)
      let label = decodedSegment
      
      if (segment === 'endpoints') label = 'Endpoints'
      else if (segment === 'releases') label = 'Releases'
      else if (segment === 'projects') label = 'Organizations'
      else if (segment === 'mitigations') label = 'Mitigations'
      else if (segment === 'vulnerabilities') label = 'Vulnerabilities'
      else if (segment === 'endpoint') label = 'Endpoint'
      else if (segment === 'release') label = 'Release'
      else if (segment === 'vulnerability') label = 'Vulnerability'
      else if (segment === 'admin') label = 'Admin'
      
      // Don't duplicate org name in breadcrumb
      if (segment !== 'projects' || !selectedOrg) {
        breadcrumbs.push({ label, path: currentPath })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav 
      className="border-b border-gray-200 dark:border-[#30363d] flex-shrink-0"
      style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
    >
      {/* Row 1: Logo, Breadcrumbs, Controls */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] focus:outline-none transition-colors"
            title="Toggle Sidebar"
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </button>

          <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.svg" alt="Ortelius" className="h-7 w-7 object-contain" />
            </Link>
            
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <ChevronRightIcon 
                    sx={{ fontSize: 16 }} 
                    className="text-gray-400 dark:text-gray-600 flex-shrink-0" 
                  />
                )}
                <Link
                  href={crumb.path}
                  className={`text-sm font-semibold whitespace-nowrap ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 dark:text-[#e6edf3]'
                      : 'text-blue-600 dark:text-[#58a6ff] hover:underline'
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] focus:outline-none transition-colors"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
          </button>
        </div>
      </div>

      {/* Row 2: Context Navigation */}
      <div className="flex items-center h-12 px-4 overflow-x-auto">
        <div className="flex items-center gap-1">
          {contextNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
                  ${active 
                    ? 'border-blue-600 dark:border-[#58a6ff] text-gray-900 dark:text-[#e6edf3]' 
                    : 'border-transparent text-gray-600 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] hover:border-gray-300 dark:hover:border-[#30363d]'
                  }
                `}
              >
                <Icon sx={{ fontSize: 18 }} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}