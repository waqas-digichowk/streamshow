import cv2
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import time
RTSP_URL = "rtsp://localhost:8554/webcam" 

class VideoStreamManager:
    def __init__(self, url):
        self.url = url
        self.cap = cv2.VideoCapture(url)
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.native_fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        
    def get_frame_and_meta(self):
        start_time = time.time()
        success, frame = self.cap.read()
        if not success:
            # Reconnect if stream drops out
            self.cap.open(self.url)
            return None, None
            
        # Optional frame downscaling or processing can occur here
        _, jpeg = cv2.imencode('.jpg', frame)
        processing_time = (time.time() - start_time) * 1000 # convert to ms
        
        return jpeg.tobytes(), processing_time

    def close(self):
        self.cap.release()

# stream_manager = VideoStreamManager(RTSP_URL)


app = FastAPI()

# Enable CORS so your React app can fetch the stream
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(RTSP_URL)
    count = 0
    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            count += 1
            # if count % 100 == 0:  # Log every 100 frames
            #     fps=cap.get(cv2.CAP_PROP_FPS)
            #     print(f"Sending frame {count} of size {buffer.nbytes} bytes at {fps:.2f} FPS")

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
