'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MainLayoutWrapper from '@/components/MainLayoutWrapper'

export default function SignupPage() {
  const router = useRouter()
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    organization: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const configRes = await fetch('/config')
      const config = await configRes.json()
      const restEndpoint = config.restEndpoint || 'http://localhost:3000/api/v1'

      const res = await fetch(`${restEndpoint}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          organization: formData.organization
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setTimeout(() => router.push('/'), 5000)
      } else {
        // Use the specific error message from backend (e.g., org owner contact info)
        throw new Error(data.error || data.message || 'Failed to create account')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setStatus('error')
      setErrorMessage(err.message || 'The system is unavailable.')
    }
  }

  const inputStyle = {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    color: isDark ? '#e6edf3' : '#111827'
  }

  return (
    <MainLayoutWrapper>
      <div 
        className="flex items-center justify-center min-h-full py-12 px-4 transition-colors duration-300"
        style={{ backgroundColor: isDark ? '#0d1117' : '#f9fafb' }}
      >
        <div 
          className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-[#30363d]"
          style={{ backgroundColor: isDark ? '#161b22' : '#ffffff' }}
        >
          <div className="text-center">
            <h2 
              className="text-3xl font-bold"
              style={{ color: isDark ? '#f0f6fc' : '#111827' }}
            >
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#8b949e]">
              Join Ortelius to manage your security posture.
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-md p-4 text-center bg-green-50 dark:bg-[rgba(46,160,67,0.15)] border border-green-200 dark:border-[rgba(46,160,67,0.5)]">
              <h3 className="text-lg font-medium text-green-800 dark:text-[#7ee787]">Request Sent!</h3>
              <p className="text-sm text-green-700 mt-2 dark:text-[#a3e9b1]">
                Check your email for an activation link. Redirecting...
              </p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c9d1d9] mb-1">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    style={inputStyle}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md shadow-sm sm:text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c9d1d9] mb-1">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    style={inputStyle}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md shadow-sm sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c9d1d9] mb-1">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  style={inputStyle}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md shadow-sm sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c9d1d9] mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md shadow-sm sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c9d1d9] mb-1">Organization</label>
                <input
                  name="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  style={inputStyle}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md shadow-sm sm:text-sm outline-none"
                />
              </div>

              {status === 'error' && (
                <div className="text-red-600 text-xs text-center p-3 rounded bg-red-50 dark:bg-[rgba(248,81,73,0.15)] border border-red-200 dark:border-[rgba(248,81,73,0.5)]">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-[#238636] dark:hover:bg-[#2ea043] focus:outline-none transition-colors"
              >
                {status === 'submitting' ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="text-center mt-4">
                <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-[#58a6ff]">
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayoutWrapper>
  )
}