import argparse
from pathlib import Path
from my_utils import load_model, calculate_reps


parser = argparse.ArgumentParser(
    prog="GYM Helper",
    description="Counting curls and making sure elbows are tucked in.",
    epilog="Thanks for using my app.")

general_args = parser.add_argument_group("general")
general_args.add_argument("-mp", "--model_path", default="./model/yolov7-w6-pose.pt", help="path to model .pt file")

finetune_args = parser.add_argument_group("finetune")
finetune_args.add_argument("-min", "--angle_max", default=150, type=int, help="angel at which a curl is completed")
finetune_args.add_argument("-max", "--angle_min", default=30, type=int, help="angel at which a curl is started")
finetune_args.add_argument("-thr", "--threshold", default=35, type=int, help="the maximum for elbow angle from body")


args = parser.parse_args()

MODEL_PATH = "./model/yolov7-w6-pose.pt" if args.model_path is None else Path(args.model_path)
print(MODEL_PATH)
if not MODEL_PATH.exists():
    print("The model file not found!")
    raise SystemExit(1)

pose_model = load_model(MODEL_PATH)

print(f"Loaded model {MODEL_PATH}")

calculate_reps(pose_model, angle_max=150, angle_min=30, threshold=35)
