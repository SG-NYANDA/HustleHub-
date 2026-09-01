import React from 'react'

export default function Hero({ onExplore }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">THE GOOD WORK NETWORK</p>
        <h1>Make room for<br /><em>better work.</em></h1>
        <p className="lede">Find independent talent for the thing you can't stop thinking about. Book with clarity, pay with confidence.</p>
        <button className="button primary" onClick={onExplore}>Explore services <span>↘</span></button>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="sticker">Design By<br /><strong>Nyanda Advance</strong></div>
        <div className="art-card">
          <span className="art-label">TODAY'S SIGNAL</span>
          <strong>Good ideas<br />need good people.</strong>
          <span className="art-line"></span>
          <small>Discover 2,400+ specialists</small>
        </div>
      </div>
    </section>
  )
}
