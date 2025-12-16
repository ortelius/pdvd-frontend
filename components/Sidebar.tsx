'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import AuthProfile from './AuthProfile' 

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

// Custom Icon Components using Material Symbols
const VulnerabilitiesIcon = ({ className, style }: any) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>threat_intelligence</span>
)

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname === path
  }

  const NavItem = ({ label, subLabel, icon: Icon, path }: any) => {
    const active = isActive(path)
    return (
      <Link 
        href={path} 
        title={!isExpanded ? label : ''}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium transition-colors relative
          ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
          ${!isExpanded ? 'justify-center' : ''}
        `}
      >
        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-sm" />}
        <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'} ${isExpanded ? 'mr-3' : ''}`} style={{ fontSize: '1.5rem' }} />
        {isExpanded && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="truncate leading-tight">{label}</span>
            {subLabel && <span className={`text-xs font-normal truncate mt-0.5 ${active ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-600'}`}>{subLabel}</span>}
          </div>
        )}
      </Link>
    )
  }

  // --- Filter Logic ---

  // Determine what to show based on category
  const isDetailView = selectedCategory === 'endpoint-detail' || selectedCategory === 'release-detail'
  const showNameFilter = !isDetailView
  const showStatusFilters = selectedCategory === 'image' // Endpoints only
  const showVulnScoreFilter = true // All pages use this
  const showOpenSSFScoreFilter = selectedCategory === 'all' // Releases only
  const showDetailFilters = isDetailView // Package & CVE filters

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
    <aside className={`${!isExpanded ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out`}>
      
      {/* Header */}
      <div className={`h-16 flex items-center px-4 border-b border-gray-100 ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isExpanded ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
           <img src="/logo.svg" alt="Logo" className="h-10 w-10 flex-shrink-0 object-contain" />
           <span className="font-bold text-lg text-gray-800 tracking-tight">Powered by DeployHub</span>
        </div>

        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        <NavItem label="Dashboard" icon={DashboardIcon} path="/" />
        <NavItem label="Synced Endpoints" subLabel="(Where It's Running)" icon={HubIcon} path="/endpoints" />
        <NavItem label="Project Releases" subLabel="(Where to Fix It)" icon={Inventory2Icon} path="/releases" />
        <NavItem label="Mitigations" subLabel="(How to Fix It)" icon={BuildIcon} path="/mitigations" />
        <NavItem label="Vulnerabilities" subLabel="(The Threat)" icon={VulnerabilitiesIcon} path="/vulnerabilities" />
      </nav>

      {/* Filters Section */}
      {showFilters && isExpanded && (
        <div className="border-t border-gray-200 p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
            >
              <SettingsIcon sx={{ width: 18, height: 18, color: 'rgb(37, 99, 235)' }} />
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              {isFiltersOpen ? <ExpandLessIcon sx={{ width: 18, height: 18, color: '#6b7280' }} /> : <ExpandMoreIcon sx={{ width: 18, height: 18, color: '#6b7280' }} />}
            </button>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {isFiltersOpen && filters && (
            <div className="space-y-6">
              
              {/* 1. Name Filter (Hidden on Detail Pages) */}
              {showNameFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Name</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Filter by name..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* 2. Endpoints Specific Filters (Status, Env, Type) */}
              {showStatusFilters && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Status</label>
                    <div className="space-y-1.5">
                      {['active', 'inactive', 'error'].map(status => (
                        <label key={status} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status) || false}
                            onChange={() => handleCheckboxChange('status', status)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Environment</label>
                    <div className="space-y-1.5">
                      {['production', 'staging', 'development', 'test'].map(env => (
                        <label key={env} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.environment?.includes(env) || false}
                            onChange={() => handleCheckboxChange('environment', env)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{env}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Type</label>
                    <div className="space-y-1.5">
                      {['kubernetes', 'docker', 'vm', 'serverless'].map(type => (
                        <label key={type} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.endpointType?.includes(type) || false}
                            onChange={() => handleCheckboxChange('endpointType', type)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 3. Vulnerability Score (Shown for ALL Categories) */}
              {showVulnScoreFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Vulnerability Score</label>
                  <div className="space-y-1.5">
                    {['critical', 'high', 'medium', 'low', 'clean'].map(severity => (
                      <label key={severity} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.vulnerabilityScore?.includes(severity) || false}
                          onChange={() => handleCheckboxChange('vulnerabilityScore', severity)}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. OpenSSF Score (Releases Only) */}
              {showOpenSSFScoreFilter && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">OpenSSF Score</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('high') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'high')}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">High (8.0+)</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('medium') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'medium')}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">Medium (6.0-7.9)</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.openssfScore?.includes('low') || false}
                        onChange={() => handleCheckboxChange('openssfScore', 'low')}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">Low (&lt;6.0)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 5. Detail Page Specific Filters (Package, CVE) */}
              {showDetailFilters && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Package</label>
                    <input
                      type="text"
                      value={filters.packageFilter || ''}
                      onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, packageFilter: e.target.value }))}
                      placeholder="Filter by package..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">CVE ID</label>
                    <input
                      type="text"
                      value={filters.searchCVE || ''}
                      onChange={(e) => setFilters && setFilters((prev: any) => ({ ...prev, searchCVE: e.target.value }))}
                      placeholder="Filter by CVE ID..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Auth Slot - Replaces hardcoded buttons */}
      <AuthProfile isExpanded={isExpanded} />
      
    </aside>
  )
}