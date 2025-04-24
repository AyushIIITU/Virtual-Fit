import cv2
import numpy as np
import time
from ultralytics import YOLO
import math

class GymTrainer:
    def __init__(self, model_path="./model/yolo11x-pose.pt"):
        # Load the YOLOv8 pose estimation model
        self.model = YOLO(model_path)
        
        # Dictionary of exercises with proper form criteria and instructions
        self.exercises = {
            "squat": {
                "keypoints": {
                    "hip_knee_ankle_angle": (90, 110),  # Proper knee angle range in degrees
                    "back_straight": True,              # Back should be straight
                },
                "form_instructions": [
                    "Keep your back straight",
                    "Knees should not go beyond toes",
                    "Lower until thighs are parallel to ground",
                    "Keep weight in your heels"
                ]
            },
            "pushup": {
                "keypoints": {
                    "elbow_angle": (80, 100),          # Proper elbow angle at bottom position
                    "body_straight": True,             # Body should form a straight line
                },
                "form_instructions": [
                    "Keep your body in a straight line",
                    "Lower until elbows are at 90 degrees",
                    "Keep core engaged",
                    "Eyes forward, not down"
                ]
            },
            "bicep_curl": {
                "keypoints": {
                    "elbow_movement": True,           # Elbow should stay fixed
                    "wrist_rotation": False,          # Wrist should not rotate
                },
                "form_instructions": [
                    "Keep your elbows fixed at your sides",
                    "Don't swing your body",
                    "Full range of motion - extend arms fully and curl all the way up",
                    "Keep wrists straight throughout the movement"
                ]
            }
        }
        
        # Current exercise tracking
        self.current_exercise = None
        self.rep_count = 0
        self.correct_form_duration = 0
        self.form_status = "Fix Form"
        self.form_feedback = []
        
        # Rep counting state
        self.in_start_position = False
        self.in_end_position = False
    
    def calculate_angle(self, point1, point2, point3):
        """Calculate angle between three points."""
        a = np.array(point1)
        b = np.array(point2)
        c = np.array(point3)
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(cosine_angle)
        
        return np.degrees(angle)
    
    def check_squat_form(self, keypoints):
        """Check if squat form is correct based on keypoints."""
        feedback = []
        correct_form = True
        
        # Extract relevant keypoints for squat
        left_hip = keypoints[11]
        right_hip = keypoints[12]
        left_knee = keypoints[13]
        right_knee = keypoints[14]
        left_ankle = keypoints[15]
        right_ankle = keypoints[16]
        left_shoulder = keypoints[5]
        right_shoulder = keypoints[6]
        
        # Calculate knee angles
        left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        
        # Check knee angle (depth of squat)
        knee_angle_range = self.exercises["squat"]["keypoints"]["hip_knee_ankle_angle"]
        if not (knee_angle_range[0] <= left_knee_angle <= knee_angle_range[1]):
            feedback.append("Adjust squat depth - knees should be at 90-110 degrees")
            correct_form = False
        
        # Calculate back angle (should be relatively straight in squat)
        back_angle = self.calculate_angle(
            [(left_shoulder[0] + right_shoulder[0])/2, (left_shoulder[1] + right_shoulder[1])/2],
            [(left_hip[0] + right_hip[0])/2, (left_hip[1] + right_hip[1])/2],
            [left_hip[0], left_hip[1] + 10]  # Point below hip to create vertical reference
        )
        
        if back_angle < 45:
            feedback.append("Keep your back more upright")
            correct_form = False
            
        # Check if knees are going too far forward past toes
        if left_knee[0] > left_ankle[0] + 20 or right_knee[0] > right_ankle[0] + 20:
            feedback.append("Keep knees behind toes")
            correct_form = False
        
        return correct_form, feedback
    
    def check_pushup_form(self, keypoints):
        """Check if pushup form is correct based on keypoints."""
        feedback = []
        correct_form = True
        
        # Extract relevant keypoints for pushup
        left_shoulder = keypoints[5]
        right_shoulder = keypoints[6]
        left_elbow = keypoints[7]
        right_elbow = keypoints[8]
        left_wrist = keypoints[9]
        right_wrist = keypoints[10]
        left_hip = keypoints[11]
        right_hip = keypoints[12]
        left_ankle = keypoints[15]
        right_ankle = keypoints[16]
        
        # Calculate elbow angles
        left_elbow_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
        right_elbow_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
        
        # Check elbow angles
        elbow_angle_range = self.exercises["pushup"]["keypoints"]["elbow_angle"]
        avg_elbow_angle = (left_elbow_angle + right_elbow_angle) / 2
        
        if not (elbow_angle_range[0] <= avg_elbow_angle <= elbow_angle_range[1]):
            feedback.append(f"Adjust elbow bend - current angle: {avg_elbow_angle:.1f}°")
            correct_form = False
        
        # Check if body is straight (hips not sagging or too high)
        shoulder_hip_ankle_angle = self.calculate_angle(
            [(left_shoulder[0] + right_shoulder[0])/2, (left_shoulder[1] + right_shoulder[1])/2],
            [(left_hip[0] + right_hip[0])/2, (left_hip[1] + right_hip[1])/2],
            [(left_ankle[0] + right_ankle[0])/2, (left_ankle[1] + right_ankle[1])/2]
        )
        
        if abs(180 - shoulder_hip_ankle_angle) > 15:
            if shoulder_hip_ankle_angle < 165:
                feedback.append("Hips too low - keep body straight")
            else:
                feedback.append("Hips too high - lower your body")
            correct_form = False
        
        return correct_form, feedback
    
    def check_bicep_curl_form(self, keypoints):
        """Check if bicep curl form is correct based on keypoints."""
        feedback = []
        correct_form = True
        
        # Extract relevant keypoints for bicep curl
        left_shoulder = keypoints[5]
        right_shoulder = keypoints[6]
        left_elbow = keypoints[7]
        right_elbow = keypoints[8]
        left_wrist = keypoints[9]
        right_wrist = keypoints[10]
        
        # Check if elbows are moving (should stay fixed)
        # We'd need to track elbow position over time for this
        # For now, check if elbow is close to body
        if abs(left_elbow[0] - left_shoulder[0]) > 30:
            feedback.append("Keep left elbow fixed at your side")
            correct_form = False
            
        if abs(right_elbow[0] - right_shoulder[0]) > 30:
            feedback.append("Keep right elbow fixed at your side")
            correct_form = False
        
        # Check wrist position (should be straight)
        left_wrist_angle = self.calculate_angle(left_elbow, left_wrist, 
                                               [left_wrist[0] + 10, left_wrist[1]])
        right_wrist_angle = self.calculate_angle(right_elbow, right_wrist,
                                                [right_wrist[0] + 10, right_wrist[1]])
        
        if abs(180 - left_wrist_angle) > 30 or abs(180 - right_wrist_angle) > 30:
            feedback.append("Keep wrists straight")
            correct_form = False
        
        return correct_form, feedback
    
    def detect_rep_movement(self, keypoints):
        """Detect starting and ending positions of a rep."""
        if self.current_exercise == "squat":
            # For squat, track knee angle
            left_hip = keypoints[11]
            left_knee = keypoints[13]
            left_ankle = keypoints[15]
            knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
            
            # Standing is start position (large angle)
            if knee_angle > 160:
                self.in_start_position = True
                self.in_end_position = False
            # Deep squat is end position (small angle)
            elif knee_angle < 120 and self.in_start_position:
                self.in_end_position = True
            
            # Count rep when returning to start from end
            if self.in_start_position and self.in_end_position and knee_angle > 160:
                self.rep_count += 1
                self.in_end_position = False
                
        elif self.current_exercise == "pushup":
            # For pushup, track elbow angle
            left_shoulder = keypoints[5]
            left_elbow = keypoints[7]
            left_wrist = keypoints[9]
            elbow_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
            
            # Extended arms is start position (large angle)
            if elbow_angle > 160:
                self.in_start_position = True
                self.in_end_position = False
            # Lowered position is end position (small angle)
            elif elbow_angle < 110 and self.in_start_position:
                self.in_end_position = True
            
            # Count rep when returning to start from end
            if self.in_start_position and self.in_end_position and elbow_angle > 160:
                self.rep_count += 1
                self.in_end_position = False
                
        elif self.current_exercise == "bicep_curl":
            # For bicep curl, track elbow angle
            right_shoulder = keypoints[6]
            right_elbow = keypoints[8]
            right_wrist = keypoints[10]
            elbow_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            # Extended arm is start position (large angle)
            if elbow_angle > 150:
                self.in_start_position = True
                self.in_end_position = False
            # Flexed arm is end position (small angle)
            elif elbow_angle < 70 and self.in_start_position:
                self.in_end_position = True
            
            # Count rep when returning to start from end
            if self.in_start_position and self.in_end_position and elbow_angle > 150:
                self.rep_count += 1
                self.in_end_position = False
    
    def process_frame(self, frame):
        """Process a single video frame for exercise tracking."""
        # Run YOLOv8 model on the frame
        results = self.model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        if len(results[0].keypoints.xy) > 0:
            # Get keypoints for the first detected person
            keypoints = results[0].keypoints.xy[0].cpu().numpy()
            
            if self.current_exercise:
                # Check form based on the selected exercise
                if self.current_exercise == "squat":
                    correct_form, feedback = self.check_squat_form(keypoints)
                elif self.current_exercise == "pushup":
                    correct_form, feedback = self.check_pushup_form(keypoints)
                elif self.current_exercise == "bicep_curl":
                    correct_form, feedback = self.check_bicep_curl_form(keypoints)
                
                # Update form status and feedback
                if correct_form:
                    self.correct_form_duration += 1
                    if self.correct_form_duration > 30:  # About 1 second at 30 fps
                        self.form_status = "Good Form"
                        # Once form is good, track reps
                        self.detect_rep_movement(keypoints)
                else:
                    self.correct_form_duration = 0
                    self.form_status = "Fix Form"
                
                self.form_feedback = feedback if feedback else ["Form looks good!"]
        
        # Overlay exercise information on the frame
        self._overlay_info(annotated_frame)
        
        return annotated_frame
    
    def _overlay_info(self, frame):
        """Add exercise information overlay to the frame."""
        # Background for text
        cv2.rectangle(frame, (10, 10), (400, 140), (0, 0, 0, 0.5), -1)
        
        # Display current exercise
        cv2.putText(frame, f"Exercise: {self.current_exercise.capitalize() if self.current_exercise else 'None Selected'}", 
                   (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Display form status with color coding
        status_color = (0, 255, 0) if self.form_status == "Good Form" else (0, 0, 255)
        cv2.putText(frame, f"Status: {self.form_status}", 
                   (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        
        # Display rep count
        cv2.putText(frame, f"Reps: {self.rep_count}", 
                   (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Display form feedback
        y_offset = 150
        for feedback in self.form_feedback[:3]:  # Show only top 3 feedback items
            cv2.putText(frame, feedback, 
                       (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
            y_offset += 30
    
    def select_exercise(self, exercise_name):
        """Select an exercise to track."""
        if exercise_name.lower() in self.exercises:
            self.current_exercise = exercise_name.lower()
            self.rep_count = 0
            self.correct_form_duration = 0
            self.form_status = "Fix Form"
            self.form_feedback = self.exercises[self.current_exercise]["form_instructions"]
            self.in_start_position = False
            self.in_end_position = False
            return True
        return False
    
    def reset_counts(self):
        """Reset rep counter."""
        self.rep_count = 0
        self.in_start_position = False
        self.in_end_position = False
    
    def run(self):
        """Run the gym trainer system with webcam."""
        cap = cv2.VideoCapture(0)
        
        # Set up window with exercise selection buttons
        cv2.namedWindow('YOLO Gym Trainer')
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process the frame
            output_frame = self.process_frame(frame)
            
            # Display the output frame
            cv2.imshow('YOLO Gym Trainer', output_frame)
            
            # Check for keyboard input
            key = cv2.waitKey(1) & 0xFF
            
            # Exercise selection keys
            if key == ord('1'):
                self.select_exercise("squat")
                print("Selected exercise: Squat")
            elif key == ord('2'):
                self.select_exercise("pushup")
                print("Selected exercise: Push-up")
            elif key == ord('3'):
                self.select_exercise("bicep_curl")
                print("Selected exercise: Bicep Curl")
            elif key == ord('r'):
                self.reset_counts()
                print("Reset rep counter")
            elif key == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    print("YOLO Gym Trainer")
    print("----------------")
    print("Select an exercise:")
    print("1: Squat")
    print("2: Push-up")
    print("3: Bicep Curl")
    print("r: Reset rep counter")
    print("q: Quit")
    
    # Create and run the gym trainer
    trainer = GymTrainer()
    trainer.run()
