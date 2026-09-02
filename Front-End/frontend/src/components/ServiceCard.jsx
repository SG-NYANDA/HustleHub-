import React from 'react'

const formatMoney = (value) => {
  return new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency: 'ZAR', 
    maximumFractionDigits: 0 
  }).format(value)
}

export default function ServiceCard({ service, index, onBook }) {
  return (
    <article className="service">
      <div className={`service-visual ${service.accent}`}>
        <b>{service.category.toUpperCase()}</b>
        <i>0{index + 1}</i>
      </div>
      <h3>{service.title}</h3>
      <p>{service.blurb}</p>
      <div className="service-meta">
        <span>{service.initials} · ★ {service.rating}</span>
        <strong>{formatMoney(service.price)}</strong>
      </div>
      <button 
        className="button primary book-button" 
        onClick={onBook}
        style={{ marginTop: '16px', justifyContent: 'center' }}
      >
        Book service ↘
      </button>
    </article>
  )
}
