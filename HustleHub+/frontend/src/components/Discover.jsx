import React, { useState } from 'react'
import ServiceCard from './ServiceCard'
import FilterButtons from './FilterButtons'

export default function Discover({ services, loading, onBookClick, request }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredServices = services.filter(item => 
    activeFilter === 'All' || item.category === activeFilter
  )

  return (
    <section id="discover" className="discover">
      <div className="section-head">
        <div>
          <p className="eyebrow">BROWSE THE TALENT</p>
          <h2>Start somewhere<br /><em>interesting.</em></h2>
        </div>
        <FilterButtons 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
        />
      </div>
      <div id="service-grid" className="service-grid">
        {loading ? (
          <p className="loading">Finding the right people...</p>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index}
              onBook={() => onBookClick(service)}
            />
          ))
        ) : (
          <p className="error">No services found.</p>
        )}
      </div>
    </section>
  )
}
