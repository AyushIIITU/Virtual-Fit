from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pathlib import Path
import json
import base64
import cv2
import numpy as np
from my_utils import load_model, calculate_reps

app = FastAPI()

# Configuration
MODEL_PATH = Path("../yolov7-w6-pose.pt")
ANGLE_MAX = 150
ANGLE_MIN = 30
THRESHOLD = 35

print("Loading model from:", MODEL_PATH)
pose_model = load_model(MODEL_PATH)
print(f"✅ Loaded model: {MODEL_PATH}")

def decode_base64_image(image_str: str):
    """Convert base64 string to OpenCV image (numpy array)"""
    try:
        image_bytes = base64.b64decode(image_str)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print("Error decoding image:", e)
        return None

@app.websocket("/ws/reps")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🟢 Client connected")

    try:
        while True:
            data = await websocket.receive_text()
            frame_data = json.loads(data)

            if "image" not in frame_data:
                await websocket.send_text(json.dumps({"error": "Missing 'image' field"}))
                continue

            image = decode_base64_image(frame_data["image"])
            if image is None:
                await websocket.send_text(json.dumps({"error": "Failed to decode image"}))
                continue

            # Pass to calculate_reps
            try:
                result = calculate_reps(
                    pose_model,
                    image,
                    angle_max=ANGLE_MAX,
                    angle_min=ANGLE_MIN,
                    threshold=THRESHOLD
                )
                await websocket.send_text(json.dumps(result))
            except Exception as e:
                print("Error in calculate_reps:", e)
                await websocket.send_text(json.dumps({"error": "Pose estimation failed"}))

    except WebSocketDisconnect:
        print("🔴 Client disconnected")
