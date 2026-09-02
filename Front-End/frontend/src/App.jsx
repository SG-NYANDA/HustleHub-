import React, { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Discover from './components/Discover'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import Modal from './components/Modal'

function App() {
  const [user, setUser] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')

  useEffect(() => {
    fetchServices()
    updateAccount()
  }, [])

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const fetchServices = async () => {
    try {
      const data = await request('/api/services')
      setServices(data.services)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setLoading(false)
    }
  }

  const updateAccount = async () => {
    try {
      const data = await request('/api/me')
      setUser(data.user)
    } catch (error) {
      setUser(null)
    }
  }

  const openModal = (content) => {
    setModalContent(content)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalContent('')
  }

  return (
    <>
      <Header user={user} onAccountClick={() => {
        if (!user) {
          openModal({ type: 'login' })
        } else {
          openModal({ type: 'dashboard' })
        }
      }} />
      <main>
        <Hero onExplore={() => document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth' })} />
        <Stats />
        <Discover 
          services={services} 
          loading={loading}
          onBookClick={(service) => openModal({ type: 'booking', service })}
          request={request}
        />
        <HowItWorks />
      </main>
      <Footer />
      <Modal isOpen={modalOpen} onClose={closeModal} content={modalContent} onAuthSuccess={() => updateAccount()} />
    </>
  )
}

export default App
