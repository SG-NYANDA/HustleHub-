import React, { useState, useEffect } from 'react'

const formatMoney = (value) => {
  return new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency: 'ZAR', 
    maximumFractionDigits: 0 
  }).format(value)
}

export default function Dashboard({ onLogout }) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        setDashboard(data)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!dashboard) return <p>Unable to load dashboard</p>

  return (
    <div>
      <p className="eyebrow">YOUR HUSTLE SNAPSHOT</p>
      <h2>
        {formatMoney(dashboard.available)}<br />
        <em>available.</em>
      </h2>
      <p>
        Gross earned {formatMoney(dashboard.gross)} · estimated tax set aside {formatMoney(dashboard.tax)}.
      </p>
      <p>{dashboard.bookings.length} booking{dashboard.bookings.length === 1 ? '' : 's'} confirmed.</p>
      <button className="button primary" onClick={handleLogout}>Sign out</button>
    </div>
  )
}
