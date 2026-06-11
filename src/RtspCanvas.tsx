import React, { useEffect, useRef } from 'react';

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

export default RtspCanvas;
