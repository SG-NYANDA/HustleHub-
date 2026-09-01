import React from 'react'

export default function Header({ user, onAccountClick }) {
  return (
    <header className="topbar">
      <a className="wordmark" href="/">
        HustleHub<span>H</span><span className="plus">+</span>
      </a>
      <nav>
        <button className="text-button" onClick={onAccountClick}>
          {user ? 'My snapshot' : 'Sign in'}
        </button>
        <a href="#discover">Discover</a>
        <a href="#how">How it works</a>
      </nav>
    </header>
  )
}
