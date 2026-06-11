import { useState, useEffect, useRef } from 'react'

import RtspCanvas from './RtspCanvas'
import './App.css'

function App() {
  return (
    <>
      <div className="container">
        {/* <!-- Left Column: Video --> */}
        <div className="video-column">
          <div className="video-wrapper">
            <RtspCanvas />

          </div>

        </div>

        {/* <!-- Right Column: Details --> */}
        <div className="details-column">
          <h1 className="video-title">Video Stream</h1>

          <div className="video-meta">
            <span>1 watching now</span>
            <span>● LIVE</span>
          </div>


          {/* <!-- New Technical Stats Grid Section --> */}
          <div className="section-title">Stream Metrics</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Frame Rate</div>
              <div className="stat-value">60 FPS</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolution</div>
              <div className="stat-value">1080p</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bitrate</div>
              <div className="stat-value">6.2 Mbps</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Latency</div>
              <div className="stat-value">1.4s</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dropped Frames</div>
              <div className="stat-value">0 (0%)</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Audio Codec</div>
              <div className="stat-value">AAC</div>
            </div>
          </div>

          <div className="section-title">Alerts</div>
          <p className="video-description">

          </p>


        </div>
      </div>








    </>
  )
}

export default App
