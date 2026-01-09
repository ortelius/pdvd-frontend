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
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { ThreatIntelligence } from '@/components/icons'

export default function TopNavigation() {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const { selectedOrg } = useOrg()

  const isActive = (path: string) => {
    return pathname === path
  }

  // Only show these nav items if an org is selected
  const contextNavItems = selectedOrg ? [
    { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { label: 'Endpoints', icon: HubIcon, path: '/endpoints' },
    { label: 'Releases', icon: Inventory2Icon, path: '/releases' },
    { label: 'Mitigations', icon: BuildIcon, path: '/mitigations' },
    { label: 'Vulnerabilities', icon: ThreatIntelligence, path: '/vulnerabilities' },
  ] : [
    { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  ]

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Ortelius', path: '/dashboard' }]

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
      className="flex-shrink-0"
      style={{ backgroundColor: isDark ? '#161b22' : '#f9fafb' }}
    >
      {/* Row 1: Logo, Organizations Button, Breadcrumbs, Controls */}
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-md transition-colors focus:outline-none ${
              isDark 
                ? 'text-gray-300 bg-[#21262d] hover:bg-[#30363d] hover:text-white' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
            }`}
            title="Toggle Sidebar"
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt="Ortelius" className="h-7 w-7 object-contain" />
          </Link>
            
            {/* Organizations Context Switch Button */}
            <Link
              href="/projects"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isDark 
                  ? 'text-gray-300 bg-[#21262d] hover:bg-[#30363d] hover:text-white' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
              }`}
              title="Switch Organization"
            >
              <AccountTreeIcon sx={{ fontSize: 18 }} />
              <span>Switch Org</span>
            </Link>
            
            {breadcrumbs.length > 1 && (
              <div className="flex items-center gap-2">
                {breadcrumbs.slice(1).map((crumb, index) => (
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
                        index === breadcrumbs.length - 2
                          ? 'text-gray-900 dark:text-[#e6edf3]'
                          : 'text-blue-600 dark:text-[#58a6ff] hover:underline'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            )}
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