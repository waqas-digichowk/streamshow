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
  const [isPlaying, setIsPlaying] = useState(true)
  const streamUrl = "http://localhost:8000/video_feed"

  return (
    <>
       <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Live RTSP Stream via FastAPI</h2>
      
      <div style={{ maxWidth: '640px', margin: '0 auto', border: '2px solid #ccc' }}>
        {isPlaying ? (
          <img 
            src={streamUrl} 
            alt="Live Camera Feed" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
            onError={(e) => {
              console.error("Failed to load video stream.");
              e.target.src = "https://placehold.co";
            }}
          />
        ) : (
          <div style={{ width: '640px', height: '480px', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Stream Paused
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pause Feed' : 'Start Feed'}
        </button>
      </div>
    </div>

        <div>
          canvas1
          <RtspCanvas />
        </div>

    </>
  )
}

export default App
