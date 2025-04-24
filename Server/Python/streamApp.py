import cv2
import numpy as np
import streamlit as st
from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO("./model/yolov8n-pose.pt")

# Exercise logic
EXERCISE_CONFIG = {
    "bicep_curl": {
        "keypoints": [5, 7, 9],  # Right shoulder, elbow, wrist
        "angle_range": (30, 160),
        "rep_phase": {"up": 160, "down": 30}
    },
    "squat": {
        "keypoints": [11, 13, 15],  # Hip, knee, ankle
        "angle_range": (90, 180),
        "rep_phase": {"down": 90, "up": 160}
    }
}

class ExerciseProcessor:
    def __init__(self, exercise_type):
        self.config = EXERCISE_CONFIG[exercise_type]
        self.rep_count = 0
        self.current_phase = "up"
        
    def calculate_angle(self, a, b, c):
        ba = a - b
        bc = c - b
        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)

        if norm_ba == 0 or norm_bc == 0:
            return np.nan

        cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        return np.degrees(np.arccos(cosine_angle))

    def process_frame(self, keypoints):
        points = [keypoints[i][:2] for i in self.config["keypoints"]]
        angle = self.calculate_angle(np.array(points[0]), np.array(points[1]), np.array(points[2]))
        form_correct = self.config["angle_range"][0] <= angle <= self.config["angle_range"][1]

        if angle >= self.config["rep_phase"]["up"] and self.current_phase == "down":
            self.rep_count += 1
            self.current_phase = "up"
        elif angle <= self.config["rep_phase"]["down"]:
            self.current_phase = "down"

        return {
            "angle": angle,
            "form_correct": form_correct,
            "rep_count": self.rep_count,
            "current_phase": self.current_phase
        }

# Streamlit UI
st.title("🏋️ Real-Time Exercise Pose Estimator")
exercise_type = st.selectbox("Choose exercise:", list(EXERCISE_CONFIG.keys()))

start = st.button("Start Webcam")

FRAME_WINDOW = st.image([])

if start:
    processor = ExerciseProcessor(exercise_type)
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            st.error("Failed to access webcam.")
            break

        frame = cv2.resize(frame, (640, 480))
        results = model(frame)
        keypoints = results[0].keypoints.data[0].cpu().numpy() if results[0].keypoints is not None else None

        if keypoints is not None:
            analysis = processor.process_frame(keypoints)
            angle_text = f"{int(analysis['angle'])}°" if not np.isnan(analysis['angle']) else "N/A"
            text = f"Reps: {analysis['rep_count']} | Angle: {angle_text} | Phase: {analysis['current_phase']}"
            color = (0, 255, 0) if analysis["form_correct"] else (0, 0, 255)
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            for x, y, conf in keypoints:
                cv2.circle(frame, (int(x), int(y)), 5, (255, 0, 0), -1)

        # Convert BGR to RGB for Streamlit
        FRAME_WINDOW.image(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    cap.release()
