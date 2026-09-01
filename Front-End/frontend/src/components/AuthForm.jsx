import React, { useState } from 'react'

export default function AuthForm({ mode = 'login', onSuccess, onSwitchMode }) {
  const [formData, setFormData] = useState({ email: '', password: '', mfaCode: '' })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const request = async (url, options) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const isRegister = mode === 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')
    
    try {
      const payload = { ...formData }
      delete payload.mfaCode

      await request(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      onSuccess()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <p className="eyebrow">{isRegister ? 'JOIN THE NETWORK' : 'WELCOME BACK'}</p>
      <h2>{isRegister ? 'Build your<br /><em>next chapter.</em>' : 'Good to<br /><em>see you.</em>'}</h2>
      <p>
        {isRegister
          ? 'Create a secure account to book talent and keep your income view in one place.'
          : 'Sign in to manage your bookings and financial snapshot.'}
      </p>
      {!isRegister && (
        <div className="security-notice">
          <strong>Your privacy matters.</strong>
          <span>Your credentials are protected and your account data is kept private.</span>
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          {isRegister ? 'Email' : 'Username or email'}
          <input
            name="email"
            type={isRegister ? 'email' : 'text'}
            required
            autoComplete={isRegister ? 'email' : 'username'}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength="10"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="At least 10 characters"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        {!isRegister && (
          <label>
            MFA verification code <span className="optional">optional</span>
            <input
              name="mfaCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter your 6-digit code"
              value={formData.mfaCode}
              onChange={handleChange}
            />
          </label>
        )}
        <button className="button primary" type="submit">
          {isRegister ? 'Create account ↘' : 'Sign in ↘'}
        </button>
        {message && <p id="form-message" className={`form-message ${messageType}`} role="alert">{message}</p>}
      </form>
      {!isRegister && <button className="text-button recovery-link">Forgot password?</button>}
      <button className="text-button" onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}>
        {isRegister ? 'Already have an account? Sign in' : 'New here? Sign up'}
      </button>
    </div>
  )
}
