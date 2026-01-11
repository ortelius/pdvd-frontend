'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person' // Added icon for profile

export default function AuthProfile({ isExpanded }: { isExpanded: boolean }) {
  const { user, login, logout, isLoading } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (isLoading) {
    return (
      <div 
        className="p-4 flex justify-center"
        style={{ backgroundColor: isDark ? '#161b22' : '#ffffff' }}
      >
        <div className="w-5 h-5 border-2 border-blue-600 dark:border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // LOGGED IN VIEW
  if (user) {
    return (
      <div 
        className="p-4 border-t border-gray-100 dark:border-gray-800"
        style={{ backgroundColor: isDark ? '#161b22' : '#f9fafb' }}
      >
        {/* User Info Block */}
        <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : 'mb-4'}`}>
          <div 
            className="w-8 h-8 rounded-full bg-blue-600 dark:bg-[#58a6ff] flex-shrink-0 flex items-center justify-center text-white dark:text-[#0d1117] font-bold text-xs uppercase"
          >
            {user.username.charAt(0)}
          </div>
          
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-[#e6edf3] truncate">
                {user.username}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[#7d8590] uppercase font-semibold tracking-wider">
                {user.role}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col gap-2 ${!isExpanded ? 'items-center' : ''}`}>
          <button 
            onClick={() => router.push('/profile')}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors w-full
              ${isDark 
                ? 'text-gray-300 hover:bg-[#30363d] hover:text-white' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            title="My Profile"
          >
            <PersonIcon sx={{ fontSize: 20 }} />
            {isExpanded && <span>My Profile</span>}
          </button>

          <button 
            onClick={logout}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors w-full
              text-red-600 dark:text-[#f85149] hover:bg-red-50 dark:hover:bg-[#f851511a]
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            title="Sign Out"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    )
  }

  // LOGGED OUT VIEW
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    const success = await login(username, password)
    if (!success) setError(true)
  }

  if (!isExpanded) {
    return (
      <div 
        className="p-4 flex flex-col items-center gap-4 border-t border-gray-100 dark:border-gray-800"
        style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
      >
        <button 
          onClick={() => router.push('/')}
          className="text-blue-600 dark:text-[#58a6ff] hover:text-blue-800 dark:hover:text-[#79c0ff]"
          title="Sign In"
        >
          <LoginIcon sx={{ fontSize: 24 }} />
        </button>
      </div>
    )
  }

  return (
    <div 
      className="p-4 border-t border-gray-100 dark:border-gray-800"
      style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ 
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            color: isDark ? '#e6edf3' : '#111827'
          }}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#30363d] rounded outline-none focus:border-blue-500 dark:focus:border-[#58a6ff]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            color: isDark ? '#e6edf3' : '#111827'
          }}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#30363d] rounded outline-none focus:border-blue-500 dark:focus:border-[#58a6ff]"
          required
        />
        
        {error && <p className="text-xs text-red-600 dark:text-[#f85149] font-medium text-center">Invalid credentials</p>}

        <button 
          type="submit"
          className="w-full py-2 bg-blue-600 dark:bg-[#238636] text-white text-xs font-bold rounded hover:bg-blue-700 dark:hover:bg-[#2ea043] transition-colors"
        >
          Sign In
        </button>

        <div className="flex flex-col gap-2 text-center pt-1">
          <button
            type="button"
            onClick={() => router.push('/auth/signup')}
            className="text-xs text-blue-600 dark:text-[#58a6ff] font-semibold hover:underline"
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            className="text-[10px] text-gray-500 dark:text-[#7d8590] underline"
          >
            Forgot Password
          </button>
        </div>
      </form>
    </div>
  )
}