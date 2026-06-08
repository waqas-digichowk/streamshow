import cv2
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse


app = FastAPI()

# Enable CORS so your React app can fetch the stream
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your actual RTSP URL or use 0 for local webcam testing
RTSP_URL = "rtsp://localhost:8554/webcam" 

def gen_frames():
    # Initialize the video capture with the RTSP source
    camera = cv2.VideoCapture(RTSP_URL)
    
    if not camera.isOpened():
        print("Error: Could not open RTSP stream.")
        return

    try:
        while True:
            success, frame = camera.read()
            if not success:
                # If a frame is dropped, take a tiny break and retry
                continue
            
            # Encode the frame into JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            # Convert buffer to bytes
            frame_bytes = buffer.tobytes()
            
            # Use the multipart/x-mixed-replace boundary format for MJPEG
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    finally:
        camera.release()

@app.get("/video_feed")
async def video_feed():
    # Return the stream using a multipart media type
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(RTSP_URL)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            
            # Send the frame as binary bytes
            await websocket.send_bytes(buffer.tobytes())
    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        cap.release()
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
