import React from 'react'

const filters = ['All', 'Design', 'Development', 'Writing']

export default function FilterButtons({ activeFilter, onFilterChange }) {
  return (
    <div className="filters">
      {filters.map(filter => (
        <button 
          key={filter}
          className={`filter ${activeFilter === filter ? 'active' : ''}`}
          data-filter={filter}
          onClick={() => onFilterChange(filter)}
        >
          {filter === 'All' ? 'All work' : filter === 'Development' ? 'Build' : filter === 'Writing' ? 'Words' : filter}
        </button>
      ))}
    </div>
  )
}
