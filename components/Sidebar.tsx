'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub' // For Synced Endpoints
import Inventory2Icon from '@mui/icons-material/Inventory2' // For Project Releases
import BuildIcon from '@mui/icons-material/Build' // For Mitigations
import SecurityIcon from '@mui/icons-material/Security' // For Vulnerabilities
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'

export default function Sidebar() {
  const pathname = usePathname()

  // Helper to determine if a menu item is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname === path
  }

  // Reusable Nav Item Component
  const NavItem = ({ 
    label, 
    icon: Icon, 
    path 
  }: { 
    label: string; icon: any; path: string 
  }) => {
    const active = isActive(path)
    
    return (
      <Link 
        href={path} 
        className={`
          group flex items-center h-10 px-3 text-sm font-medium transition-colors relative
          ${active 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        {/* Active Left Border Indicator */}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-sm" />
        )}

        <Icon 
          className={`mr-3 w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
          style={{ fontSize: '1.25rem' }} 
        />
        
        <span className="flex-1 truncate">{label}</span>
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      
      {/* Main Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        <NavItem 
          label="Dashboard" 
          icon={DashboardIcon} 
          path="/" 
        />
        <NavItem 
          label="Synced Endpoints (Where It's Running)" 
          icon={HubIcon} 
          path="/endpoints" 
        />
        <NavItem 
          label="Project Releases (Where to Fix It)" 
          icon={Inventory2Icon} 
          path="/releases" 
        />
        <NavItem 
          label="Mitigations (How to Fix It)" 
          icon={BuildIcon} 
          path="/mitigations" 
        />
        <NavItem 
          label="Vulnerabilities (The Threat)" 
          icon={SecurityIcon} 
          path="/vulnerabilities" 
        />
      </nav>

      {/* Auth Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button className="w-full py-2 text-sm text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Sign in
        </button>
        <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
          Sign up
        </button>
      </div>

      {/* Footer / Collapse Button */}
      <div className="p-3 border-t border-gray-200">
        <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <KeyboardArrowLeftIcon />
        </button>
      </div>
    </aside>
  )
}