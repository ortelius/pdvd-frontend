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
      // Fetch dynamic configuration
      const configRes = await fetch('/config')
      const config = await configRes.json()

      const res = await fetch(`${config.restEndpoint}/auth/forgot-password`, {
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
      {/* ... (rest of the component UI remains the same) */}
    </div>
  )
}