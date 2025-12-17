'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      // Call the Upstream Backend to trigger the email
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Could not find that email address or the system is unavailable.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Activate Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your work email to receive your activation link or reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>We've sent a link to <b>{email}</b>. Please check your inbox (and spam folder) to set your password.</p>
                </div>
                <div className="mt-4">
                  <Link href="/" className="text-sm font-medium text-green-600 hover:text-green-500">
                    &larr; Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {status === 'error' && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Activation Link'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                Cancel and return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}