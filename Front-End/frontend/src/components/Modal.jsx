import React, { useState } from 'react'
import AuthForm from './AuthForm'
import BookingForm from './BookingForm'
import Dashboard from './Dashboard'

export default function Modal({ isOpen, onClose, content, onAuthSuccess }) {
  if (!isOpen) return null

  const handleAuthSuccess = () => {
    onAuthSuccess()
    onClose()
  }

  return (
    <div className="modal">
      <div className="modal-panel">
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <div id="modal-content">
          {content.type === 'login' && (
            <AuthForm mode="login" onSuccess={handleAuthSuccess} onSwitchMode={(mode) => {}} />
          )}
          {content.type === 'register' && (
            <AuthForm mode="register" onSuccess={handleAuthSuccess} onSwitchMode={(mode) => {}} />
          )}
          {content.type === 'booking' && (
            <BookingForm service={content.service} onSuccess={() => {
              onAuthSuccess()
              onClose()
            }} onNeedLogin={() => {}} />
          )}
          {content.type === 'dashboard' && (
            <Dashboard onLogout={() => {
              onAuthSuccess()
              onClose()
            }} />
          )}
        </div>
      </div>
    </div>
  )
}
