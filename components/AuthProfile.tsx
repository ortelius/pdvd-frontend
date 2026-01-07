'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'

export default function AuthProfile({ isExpanded }: { isExpanded: boolean }) {
  const { user, login, logout, isLoading } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  // Show a loading spinner instead of hiding the component
  if (isLoading) {
    return (
      <div 
        className="p-4 border-t border-gray-200 dark:border-[#30363d] mt-auto flex justify-center"
        style={{ backgroundColor: isDark ? '#161b22' : '#ffffff' }}
      >
        <div className="w-5 h-5 border-2 border-blue-600 dark:border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // VIEW A: Logged In User Profile
  if (user) {
    return (
      <div 
        className="p-4 border-t border-gray-200 dark:border-[#30363d] mt-auto"
        style={{ backgroundColor: isDark ? '#161b22' : '#f9fafb' }}
      >
        <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : 'mb-3'}`}>
          <div 
            className="w-8 h-8 rounded-full bg-blue-600 dark:bg-[#58a6ff] flex-shrink-0 flex items-center justify-center text-white dark:text-[#0d1117] font-bold text-xs uppercase"
            title={user.username}
          >
            {user.username.charAt(0)}
          </div>
          
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-[#e6edf3] truncate">{user.username}</p>
              <p className="text-[10px] text-gray-500 dark:text-[#7d8590] uppercase font-semibold tracking-wider">
                {user.role}
              </p>
            </div>
          )}
        </div>

        {isExpanded ? (
          <button 
            onClick={logout}
            className="w-full py-1.5 text-xs text-red-600 dark:text-[#f85149] border border-red-200 dark:border-[#f8515140] rounded hover:bg-red-50 dark:hover:bg-[#f8515120] transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <button 
            onClick={logout}
            title="Sign Out"
            className="mt-3 w-full flex justify-center text-red-600 dark:text-[#f85149] hover:text-red-800 dark:hover:text-[#ff7b72]"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </button>
        )}
      </div>
    )
  }

  // VIEW B: Login Section (Form when expanded, Icon when collapsed)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    const success = await login(username, password)
    if (!success) setError(true)
  }

  if (!isExpanded) {
    return (
      <div 
        className="p-4 border-t border-gray-200 dark:border-[#30363d] mt-auto flex flex-col items-center gap-4"
        style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
      >
        <button 
          onClick={() => router.push('/auth/login')}
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
      className="p-4 border-t border-gray-200 dark:border-[#30363d] mt-auto"
      style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ 
              backgroundColor: isDark ? '#0d1117' : '#ffffff',
              color: isDark ? '#e6edf3' : '#111827'
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#30363d] rounded focus:border-blue-500 dark:focus:border-[#58a6ff] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#58a6ff] outline-none placeholder:text-gray-400 dark:placeholder:text-[#7d8590]"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              backgroundColor: isDark ? '#0d1117' : '#ffffff',
              color: isDark ? '#e6edf3' : '#111827'
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#30363d] rounded focus:border-blue-500 dark:focus:border-[#58a6ff] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#58a6ff] outline-none placeholder:text-gray-400 dark:placeholder:text-[#7d8590]"
            required
          />
        </div>
        
        {error && <p className="text-xs text-red-600 dark:text-[#f85149] font-medium text-center">Invalid credentials</p>}

        <button 
          type="submit"
          className="w-full py-2 bg-blue-600 dark:bg-[#238636] text-white dark:text-[#e6edf3] text-xs font-bold rounded hover:bg-blue-700 dark:hover:bg-[#2ea043] transition-colors"
        >
          Sign In
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            className="text-[10px] text-gray-500 dark:text-[#7d8590] hover:text-blue-600 dark:hover:text-[#58a6ff] underline"
          >
            Forgot Password / Activate Account
          </button>
        </div>
      </form>
    </div>
  )
}