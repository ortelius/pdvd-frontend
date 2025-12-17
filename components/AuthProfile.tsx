'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AuthProfile({ isExpanded }: { isExpanded: boolean }) {
  const { user, login, logout, isLoading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  // Hide if collapsed or loading to prevent layout shift
  if (!isExpanded || isLoading) return null

  // VIEW A: Logged In User Profile
  if (user) {
    return (
      <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
            {user.username.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
              {user.role}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  // VIEW B: Login Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    const success = await login(username, password)
    if (!success) setError(true)
  }

  return (
    <div className="p-4 border-t border-gray-200 mt-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        
        {error && <p className="text-xs text-red-600 font-medium text-center">Invalid credentials</p>}

        <button 
          type="submit"
          className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            className="text-[10px] text-gray-500 hover:text-blue-600 underline"
          >
            Forgot Password / Activate Account
          </button>
        </div>
      </form>
    </div>
  )
}