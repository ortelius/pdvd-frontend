'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useExport } from '@/context/ExportContext' 
import AuthProfile from '@/components/AuthProfile'

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DownloadIcon from '@mui/icons-material/Download'

// Local SVG Icons
import { ThreatIntelligence } from '@/components/icons'

interface SidebarProps {
  filters?: {
    vulnerabilityScore: string[]
    openssfScore: string[]
    name: string
    status?: string[]
    environment?: string[]
    endpointType?: string[]
    packageFilter?: string
    searchCVE?: string
  }
  setFilters?: (filters: any) => void
  selectedCategory?: string
}

export default function Sidebar({ filters, setFilters, selectedCategory }: SidebarProps) {
  const pathname = usePathname()
  const { isExpanded, toggleSidebar } = useSidebar()
  const { isDark, toggleTheme } = useTheme()
  const { hasRole } = useAuth()
  const { toggleExportMode } = useExport()
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname === path
  }

  // --- Dynamic Styles based on isDark state to ensure sync ---
  const inputClasses = `w-full px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 ${
    isDark 
      ? 'bg-[#0d1117] border-[#30363d] text-[#e6edf3] focus:ring-[#58a6ff] placeholder-gray-600' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-400'
  }`

  const buttonClasses = `w-full flex items-center justify-center gap-2 ${!isExpanded ? 'p-2' : 'px-3 py-2'} text-sm font-medium rounded-md transition-colors border border-transparent ${
    isDark 
      ? 'text-gray-300 bg-[#21262d] hover:bg-[#30363d] hover:text-white border-[#30363d]' 
      : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
  }`

  const checkboxClasses = `w-3.5 h-3.5 border rounded focus:ring-blue-500 ${
    isDark
      ? 'bg-[#0d1117] border-[#30363d] text-[#58a6ff] checked:bg-[#58a6ff] checked:border-[#58a6ff]'
      : 'bg-white border-gray-300 text-blue-600 checked:bg-blue-600 checked:border-blue-600'
  }`

  const NavItem = ({ label, subLabel, icon: Icon, path }: any) => {
    const active = isActive(path)
    return (
      <Link
        href={path}
        title={!isExpanded ? label : ''}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium transition-colors relative rounded-md mx-2
          ${active ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}
          ${!isExpanded ? 'justify-center' : ''}
        `}
      >
        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-sm" />}
        <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'} ${isExpanded ? 'mr-3' : ''}`} style={{ fontSize: '1.5rem' }} />
        {isExpanded && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="truncate leading-tight">{label}</span>
            {subLabel && <span className={`text-xs font-normal truncate mt-0.5 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>{subLabel}</span>}
          </div>
        )}
      </Link>
    )
  }

  // --- Filter Logic (Standard) ---
  const isDetailView = selectedCategory === 'endpoint-detail' || selectedCategory === 'release-detail'
  const showNameFilter = !isDetailView
  const showStatusFilters = selectedCategory === 'image'
  const showVulnScoreFilter = true
  const showOpenSSFScoreFilter = selectedCategory === 'all'
  const showDetailFilters = isDetailView
  const showFilters = filters && setFilters && selectedCategory
  const hasActiveFilters = filters && (
    (filters.vulnerabilityScore && filters.vulnerabilityScore.length > 0) ||
    (filters.openssfScore && filters.openssfScore.length > 0) ||
    (filters.name && filters.name !== '') ||
    (filters.status && filters.status.length > 0) ||
    (filters.environment && filters.environment.length > 0) ||
    (filters.endpointType && filters.endpointType.length > 0) ||
    (filters.packageFilter && filters.packageFilter !== '') ||
    (filters.searchCVE && filters.searchCVE !== '')
  )

  const handleCheckboxChange = (category: string, value: string) => {
    if (!setFilters) return
    setFilters((prev: any) => {
      const currentValues = prev[category] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value]
      return { ...prev, [category]: newValues }
    })
  }

  const clearFilters = () => {
    if (!setFilters) return
    setFilters({
      vulnerabilityScore: [],
      openssfScore: [],
      name: '',
      status: [],
      environment: [],
      endpointType: [],
      packageFilter: '',
      searchCVE: ''
    })
  }

  return (
    <aside 
      className={`${!isExpanded ? 'w-20' : 'w-64'} border-r border-gray-200 flex flex-col h-full overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out`}
      style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
    >

      {/* Header */}
      <div 
        className={`h-16 flex items-center px-4 border-b border-gray-100 ${!isExpanded ? 'justify-center' : 'justify-between'}`}
        style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
      >
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isExpanded ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
           <img src="/logo.svg" alt="Logo" className="h-10 w-10 flex-shrink-0 object-contain" />
           <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-[#e6edf3]' : 'text-black'}`}>Ortelius</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] focus:outline-none transition-colors"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
          </button>
          
          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] focus:outline-none transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeftIcon />
            </button>
          )}
          
          {!isExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-700 dark:hover:text-[#e6edf3] focus:outline-none transition-colors"
              title="Expand Sidebar"
            >
              <MenuIcon />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}>
        <NavItem label="Dashboard" icon={DashboardIcon} path="/" />
        <NavItem label="Synced Endpoints" subLabel="(Where It's Running)" icon={HubIcon} path="/endpoints" />
        <NavItem label="Project Releases" subLabel="(Where to Fix It)" icon={Inventory2Icon} path="/releases" />
        <NavItem label="Mitigations" subLabel="(How to Fix It)" icon={BuildIcon} path="/mitigations" />
        <NavItem label="Vulnerabilities" subLabel="(The Threat)" icon={ThreatIntelligence} path="/vulnerabilities" />

        {hasRole(['admin']) && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <div className={!isExpanded ? "hidden" : "px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"}>
              Administration
            </div>

            <NavItem
              label="User Management"
              subLabel="(Access Control)"
              icon={ManageAccountsIcon}
              path="/admin/users"
            />
            <NavItem
              label="System Settings"
              subLabel="(Config)"
              icon={SettingsIcon}
              path="/admin/settings"
            />
          </>
        )}
      </nav>

      {/* Filters Section */}
      {showFilters && isExpanded && (
        <div 
          className="border-t border-gray-200 p-4 animate-fadeIn" 
          style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#21262d] p-1 -ml-1 rounded transition-colors"
            >
              <SettingsIcon sx={{ width: 18, height: 18, color: 'rgb(88, 166, 255)' }} />
              <h3 className="font-semibold text-gray-900 dark:text-[#e6edf3] text-sm">Filters</h3>
              {isFiltersOpen ? <ExpandLessIcon sx={{ width: 18, height: 18 }} className="text-gray-500 dark:text-gray-400" /> : <ExpandMoreIcon sx={{ width: 18, height: 18 }} className="text-gray-500 dark:text-gray-400" />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 dark:text-[#58a6ff] hover:text-blue-700 dark:hover:text-[#79c0ff] font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {isFiltersOpen && filters && (
            <div className="space-y-6">
              {showNameFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">Name</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Filter by name..."
                    className={inputClasses}
                  />
                </div>
              )}
              {showStatusFilters && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">Status</label>
                    <div className="space-y-1.5">
                      {['active', 'inactive', 'error'].map(status => (
                        <label key={status} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status) || false}
                            onChange={() => handleCheckboxChange('status', status)}
                            className={checkboxClasses}
                          />
                          <span className="ml-2 text-xs text-gray-700 dark:text-[#c9d1d9] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3] capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {showVulnScoreFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">Vulnerability Score</label>
                  <div className="space-y-1.5">
                    {['critical', 'high', 'medium', 'low', 'clean'].map(severity => (
                      <label key={severity} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.vulnerabilityScore?.includes(severity) || false}
                          onChange={() => handleCheckboxChange('vulnerabilityScore', severity)}
                          className={checkboxClasses}
                        />
                        <span className="ml-2 text-xs text-gray-700 dark:text-[#c9d1d9] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3] capitalize">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {showOpenSSFScoreFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">OpenSSF Score</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('high') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'high')}
                        className={checkboxClasses}
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-[#c9d1d9] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3]">High (8.0+)</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('medium') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'medium')}
                        className={checkboxClasses}
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-[#c9d1d9] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3]">Medium (6.0-7.9)</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('low') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'low')}
                        className={checkboxClasses}
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-[#c9d1d9] group-hover:text-gray-900 dark:group-hover:text-[#e6edf3]">Low (&lt;6.0)</span>
                    </label>
                  </div>
                </div>
              )}

              {showDetailFilters && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">Package</label>
                    <input
                      type="text"
                      value={filters.packageFilter || ''}
                      onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, packageFilter: e.target.value }))}
                      placeholder="Filter by package..."
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#c9d1d9] mb-2 block">CVE ID</label>
                    <input
                      type="text"
                      value={filters.searchCVE || ''}
                      onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, searchCVE: e.target.value }))}
                      placeholder="Filter by CVE ID..."
                      className={inputClasses}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Auth Slot */}
      <AuthProfile isExpanded={isExpanded} />

      {/* Save as SVG Button (Persistent Footer under Auth) */}
      <div 
        className="p-4 border-t border-gray-200"
        style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
      >
        <button
          onClick={toggleExportMode}
          className={buttonClasses}
          title={!isExpanded ? "Save as SVG" : ''}
        >
          <DownloadIcon sx={{ fontSize: 20 }} className={isDark ? "text-gray-400" : "text-gray-500"} />
          {isExpanded && <span>Save as SVG</span>}
        </button>
      </div>

    </aside>
  )
}