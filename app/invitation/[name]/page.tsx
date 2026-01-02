'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActivationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'loading' | 'idle' | 'submitting' | 'success' | 'error'>('loading')
  const [invitationData, setInvitationData] = useState<{ username: string; email: string } | null>(null)
  const [error, setError] = useState('')

  // Helper to fetch the REST endpoint dynamically from the config route
const getRestEndpoint = async () => {
const res = await fetch('/api/config')

// Safety check: ensure the response is OK and is JSON
if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
    console.error('Failed to load config, received HTML/Error instead of JSON')
    // Fallback to a safe default if config fails
    return 'http://localhost:3000/api/v1' 
}

const config = await res.json()
return config.restEndpoint || 'http://localhost:3000/api/v1'
}

  // 1. Verify token and fetch user info on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const restEndpoint = await getRestEndpoint()
        const res = await fetch(`${restEndpoint}/invitation/${token}`)
        
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
    if (token) verifyToken()
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
      const res = await fetch(`${restEndpoint}/invitation/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Set Your Password</h2>
          {invitationData && (
            <p className="mt-2 text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-900">{invitationData.username}</span>. 
              Please choose a password to activate your account.
            </p>
          )}
        </div>

        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4 text-center">
             <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-green-400 text-5xl mb-2">check_circle</span>
                <h3 className="text-lg font-medium text-green-800">Account Activated!</h3>
                <p className="text-sm text-green-700 mt-1">You have been logged in. Redirecting to dashboard...</p>
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

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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