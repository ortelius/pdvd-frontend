'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BuildIcon from '@mui/icons-material/Build'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  // --- Persistence Logic ---
  useEffect(() => {
    // Check local storage on mount to restore the user's preference
    const storedState = localStorage.getItem('ortelius_sidebar_collapsed')
    if (storedState === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  const handleToggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // Save preference to local storage
    localStorage.setItem('ortelius_sidebar_collapsed', String(newState))
  }
  // -------------------------

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname === path
  }

  const NavItem = ({ 
    label, 
    subLabel,
    icon: Icon, 
    path 
  }: { 
    label: string; subLabel?: string; icon: any; path: string 
  }) => {
    const active = isActive(path)
    
    return (
      <Link 
        href={path} 
        title={isCollapsed ? label : ''}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium transition-colors relative
          ${active 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-sm" />
        )}
        <Icon 
          className={`w-6 h-6 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'} ${!isCollapsed ? 'mr-3' : ''}`} 
          style={{ fontSize: '1.5rem' }} 
        />
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="truncate leading-tight">{label}</span>
            {subLabel && (
              <span className={`text-xs font-normal truncate mt-0.5 ${active ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-600'}`}>
                {subLabel}
              </span>
            )}
          </div>
        )}
      </Link>
    )
  }

  const showFilters = filters && setFilters && selectedCategory
  const hasActiveFilters = filters && (
    filters.vulnerabilityScore.length > 0 || 
    filters.openssfScore.length > 0 || 
    filters.name !== '' ||
    (filters.status && filters.status.length > 0) ||
    (filters.environment && filters.environment.length > 0) ||
    (filters.endpointType && filters.endpointType.length > 0)
  )

  const handleCheckboxChange = (category: 'vulnerabilityScore' | 'openssfScore' | 'status' | 'environment' | 'endpointType', value: string) => {
    if (!setFilters) return
    setFilters((prev: any) => {
      const currentValues = prev[category] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value]
      return { ...prev, [category]: newValues }
    })
  }

  const handleNameChange = (value: string) => {
    if (!setFilters) return
    setFilters((prev: any) => ({ ...prev, name: value }))
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
    })
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out`}>
      
      {/* Header Area: Logo & Collapse Toggle */}
      <div className={`h-16 flex items-center px-4 border-b border-gray-100 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        
        {/* Logo - Hidden when collapsed to save space */}
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
           <img 
             src="/logo.jpg" 
             alt="Ortelius Logo" 
             className="h-10 w-10 flex-shrink-0 object-contain" 
           />
           <span className="font-bold text-lg text-gray-800 tracking-tight">Ortelius</span>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={handleToggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        <NavItem label="Dashboard" icon={DashboardIcon} path="/" />
        <NavItem 
          label="Synced Endpoints" 
          subLabel="(Where It's Running)"
          icon={HubIcon} 
          path="/endpoints" 
        />
        <NavItem 
          label="Project Releases" 
          subLabel="(Where to Fix It)"
          icon={Inventory2Icon} 
          path="/releases" 
        />
        <NavItem 
          label="Mitigations" 
          subLabel="(How to Fix It)"
          icon={BuildIcon} 
          path="/mitigations" 
        />
        <NavItem 
          label="Vulnerabilities" 
          subLabel="(The Threat)"
          icon={SecurityIcon} 
          path="/vulnerabilities" 
        />
      </nav>

      {/* Filters Section - Hidden when collapsed */}
      {showFilters && !isCollapsed && (
        <div className="border-t border-gray-200 p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
            >
              <SettingsIcon sx={{ width: 18, height: 18, color: 'rgb(37, 99, 235)' }} />
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              {isFiltersOpen ? (
                <ExpandLessIcon sx={{ width: 18, height: 18, color: 'rgb(107, 114, 128)' }} />
              ) : (
                <ExpandMoreIcon sx={{ width: 18, height: 18, color: 'rgb(107, 114, 128)' }} />
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Clear
              </button>
            )}
          </div>

          {/* Collapsible Content */}
          {isFiltersOpen && (
            <div className="space-y-4">
              {/* Name Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category Specific Filters (Image/Endpoint) */}
              {selectedCategory === 'image' && (
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

              {/* Release/Vulnerability filters */}
              {(selectedCategory === 'all' || selectedCategory === 'plugin' || selectedCategory === 'mitigations') && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Vulnerability Score</label>
                    <div className="space-y-1.5">
                      {['critical', 'high', 'medium', 'low', 'clean'].map(severity => (
                        <label key={severity} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.vulnerabilityScore.includes(severity)}
                            onChange={() => handleCheckboxChange('vulnerabilityScore', severity)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{severity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">OpenSSF Score</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.openssfScore.includes('high')}
                          onChange={() => handleCheckboxChange('openssfScore', 'high')}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">High (8.0+)</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.openssfScore.includes('medium')}
                          onChange={() => handleCheckboxChange('openssfScore', 'medium')}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">Medium (6.0-7.9)</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.openssfScore.includes('low')}
                          onChange={() => handleCheckboxChange('openssfScore', 'low')}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">Low (&lt;6.0)</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Detail page filters */}
              {(selectedCategory === 'endpoint-detail' || selectedCategory === 'release-detail') && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Severity</label>
                    <div className="space-y-1.5">
                      {['critical', 'high', 'medium', 'low', 'clean'].map(severity => (
                        <label key={severity} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.vulnerabilityScore.includes(severity)}
                            onChange={() => handleCheckboxChange('vulnerabilityScore', severity)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 capitalize">{severity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Package</label>
                    <input
                      type="text"
                      value={filters.packageFilter || ''}
                      onChange={(e) => {
                        if (!setFilters) return
                        setFilters((prev: any) => ({ ...prev, packageFilter: e.target.value }))
                      }}
                      placeholder="Filter by package..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">CVE ID</label>
                    <input
                      type="text"
                      value={filters.searchCVE || ''}
                      onChange={(e) => {
                        if (!setFilters) return
                        setFilters((prev: any) => ({ ...prev, searchCVE: e.target.value }))
                      }}
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

      {/* Auth Buttons */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 space-y-3 mt-auto">
          <button className="w-full py-2 text-sm text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Sign in
          </button>
          <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            Sign up
          </button>
        </div>
      )}
    </aside>
  )
}