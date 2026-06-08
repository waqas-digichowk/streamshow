import { useState, useEffect, useRef  } from 'react'

import './App.css'

const RtspCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  console.log("RtspCanvas component rendered.");

  useEffect(() => {
    // Connect to FastAPI WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/stream');
    ws.binaryType = 'arraybuffer';
    console.log("WebSocket connection established.");
    ws.onmessage = (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Convert the binary ArrayBuffer to a Blob, then to an Image
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        // Draw the frame on the canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>      
      <canvas ref={canvasRef} style={{ border: '1px solid black', maxWidth: '100%' }} />
    </div>
  );
};


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
                    <div className    ="stat-value">6.2 Mbps</div>
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
