'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MainLayoutWrapper from '@/components/MainLayoutWrapper'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

// Icons
import BusinessIcon from '@mui/icons-material/Business'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'

export default function ProfilePage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user === null) {
       router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus('error')
      setMessage("New passwords do not match")
      return
    }

    setStatus('submitting')
    try {
      const configRes = await fetch('/config')
      const config = await configRes.json()
      const restEndpoint = config.restEndpoint || 'http://localhost:3000/api/v1'

      const res = await fetch(`${restEndpoint}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage("Password updated successfully")
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update password')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  // --- Dynamic Theme Styles ---
  const pageBackground = isDark ? 'bg-[#0d1117]' : 'bg-gray-50'
  
  const cardStyle = {
    backgroundColor: isDark ? '#161b22' : '#ffffff',
    borderColor: isDark ? '#30363d' : '#e5e7eb',
  }

  const inputStyle = {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    borderColor: isDark ? '#30363d' : '#d1d5db',
    color: isDark ? '#e6edf3' : '#111827'
  }

  const textClass = isDark ? "text-[#e6edf3]" : "text-gray-900"
  const labelClass = isDark ? "text-[#8b949e]" : "text-gray-600"
  const headingClass = isDark ? "text-[#f0f6fc]" : "text-gray-900"
  const mutedClass = isDark ? "text-[#8b949e]" : "text-gray-500"

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <MainLayoutWrapper>
        <div className={`flex-1 px-8 py-8 overflow-y-auto ${pageBackground} min-h-full`}>
          <h1 className={`text-3xl font-bold mb-8 ${headingClass}`}>User Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Account Details Card */}
            <div 
              className="p-6 rounded-xl border shadow-sm transition-colors flex flex-col h-full"
              style={cardStyle}
            >
              <h2 className={`text-xl font-semibold mb-6 ${headingClass}`}>Account Details</h2>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-sm">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <p className={`text-lg font-medium ${textClass}`}>{user.username}</p>
                  <p className={`text-sm ${mutedClass}`}>{user.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Username Row */}
                <div className="flex items-start gap-3">
                  <PersonIcon className={mutedClass} sx={{ fontSize: 20, marginTop: '2px' }} />
                  <div>
                    <label className={`text-xs uppercase font-semibold tracking-wider block mb-0.5 ${labelClass}`}>Username</label>
                    <p className={`text-base font-medium ${textClass}`}>{user.username}</p>
                  </div>
                </div>

                {/* Email Row */}
                <div className="flex items-start gap-3">
                  <EmailIcon className={mutedClass} sx={{ fontSize: 20, marginTop: '2px' }} />
                  <div>
                    <label className={`text-xs uppercase font-semibold tracking-wider block mb-0.5 ${labelClass}`}>Email Address</label>
                    <p className={`text-base font-medium ${textClass}`}>{user.email || 'No email provided'}</p>
                  </div>
                </div>

                <div className={`border-t my-4 ${isDark ? 'border-[#30363d]' : 'border-gray-100'}`}></div>

                {/* Organization List Section */}
                <div>
                  <label className={`text-xs uppercase font-semibold tracking-wider block mb-3 ${labelClass}`}>Organizations & Access</label>
                  
                  {user.orgs && user.orgs.length > 0 ? (
                    <div className="space-y-2">
                      {user.orgs.map((org, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <BusinessIcon className={isDark ? "text-blue-400" : "text-blue-600"} sx={{ fontSize: 20 }} />
                            <span className={`font-medium ${textClass}`}>{org}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <VerifiedUserIcon className={isDark ? "text-green-400" : "text-green-600"} sx={{ fontSize: 16 }} />
                            <span className={`text-xs uppercase font-bold ${
                              isDark ? 'text-green-400' : 'text-green-700'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg border border-dashed text-center ${
                      isDark ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <p className={`text-sm ${mutedClass}`}>No organizations assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Change Password Card */}
            <div 
              className="p-6 rounded-xl border shadow-sm transition-colors flex flex-col h-full"
              style={cardStyle}
            >
              <h2 className={`text-xl font-semibold mb-6 ${headingClass}`}>Change Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 flex-1">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelClass}`}>Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    style={inputStyle}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelClass}`}>New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    style={inputStyle}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelClass}`}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    style={inputStyle}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-md text-sm font-medium ${
                    status === 'success' 
                      ? (isDark ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-green-50 text-green-700 border border-green-200')
                      : (isDark ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-200')
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {status === 'submitting' ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </MainLayoutWrapper>
    </div>
  )
}