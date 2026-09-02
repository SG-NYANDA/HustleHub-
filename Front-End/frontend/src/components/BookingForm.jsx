import React, { useState } from 'react'

const formatMoney = (value) => {
  return new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency: 'ZAR', 
    maximumFractionDigits: 0 
  }).format(value)
}

export default function BookingForm({ service, onSuccess, onNeedLogin }) {
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const minDate = new Date().toISOString().slice(0, 10)

  const request = async (url, options) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')

    try {
      await request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ serviceId: service.id, date })
      })
      setMessage('Booking confirmed. Your financial snapshot has been updated.')
      setMessageType('success')
      setTimeout(onSuccess, 1800)
    } catch (error) {
      if (error.message === 'Sign in required') {
        onNeedLogin()
      } else {
        setMessage(error.message)
        setMessageType('error')
      }
    }
  }

  return (
    <div>
      <p className="eyebrow">BOOK WITH {service.freelancer.toUpperCase()}</p>
      <h2>{service.title}</h2>
      <p>{formatMoney(service.price)} · {service.duration}</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Preferred date
          <input
            name="date"
            type="date"
            min={minDate}
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button className="button primary" type="submit">Request booking ↘</button>
        {message && <p className={`form-message ${messageType}`}>{message}</p>}
      </form>
    </div>
  )
}
