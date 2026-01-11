'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActivationPage() {
  const params = useParams()
  const router = useRouter()
  
  // FIX: Explicitly decode the token to handle URL encoding artifacts (e.g. %3D -> =)
  const rawParam = Array.isArray(params.name) ? params.name[0] : params.name
  const token = rawParam ? decodeURIComponent(rawParam) : ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'loading' | 'idle' | 'submitting' | 'success' | 'error'>('loading')
  const [invitationData, setInvitationData] = useState<{ username: string; email: string } | null>(null)
  const [error, setError] = useState('')

  // Helper to fetch the REST endpoint dynamically
  const getRestEndpoint = async () => {
    try {
      const res = await fetch('/config')
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        return 'http://localhost:8080/api/v1' 
      }
      const config = await res.json()
      return config.restEndpoint || 'http://localhost:8080/api/v1'
    } catch (e) {
      return 'http://localhost:8080/api/v1'
    }
  }

  // 1. Verify token on mount (GET request)
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return

      try {
        const restEndpoint = await getRestEndpoint()
        // Encode for URL safety when making the GET request via URL path
        const res = await fetch(`${restEndpoint}/invitation/${encodeURIComponent(token)}`)
        
        if (res.ok) {
          const data = await res.json()
          setInvitationData(data)
          setStatus('idle')
        } else {
          setStatus('error')
          setError('This invitation link is invalid or has expired.')
        }
      } catch (err) {
        setStatus('error')
        setError('System unavailable. Please try again later.')
      }
    }
    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setStatus('submitting')
    try {
      const restEndpoint = await getRestEndpoint()
      
      // FIX: Send token in body (raw) to assume 100% data integrity
      // The URL path is also included but the backend will prioritize the body.
      const res = await fetch(`${restEndpoint}/invitation/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, // Send raw token (with = sign)
          password, 
          password_confirm: confirmPassword 
        }),
      })

      if (res.ok) {
        setStatus('success')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => router.push('/'), 2000)
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to activate account')
      }
    } catch (err: any) {
      setStatus('error')
      setError(err.message)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Set Your Password</h2>
          {invitationData && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Welcome, <span className="font-semibold text-gray-900">{invitationData.username}</span></p>
              <p className="mt-1">Please choose a password to activate your account.</p>
            </div>
          )}
        </div>

        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4 text-center">
             <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-green-800">Account Activated!</h3>
                <p className="text-sm text-green-700 mt-1">You have been logged in. Redirecting...</p>
             </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="sr-only">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="New Password"
                />
              </div>
              <div>
                <label className="sr-only">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {status === 'submitting' ? 'Activating...' : 'Activate Account'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                Return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}