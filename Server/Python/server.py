from fastapi import FastAPI, File, UploadFile
import torch
import torchvision.transforms as transforms
from PIL import Image
import timm
import torch.nn as nn
import uvicorn
from io import BytesIO

app = FastAPI()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class FoodClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.model = timm.create_model('vit_base_patch16_224', pretrained=False)
        self.model.head = nn.Linear(self.model.head.in_features, num_classes)

    def forward(self, x):
        return self.model(x)

model = FoodClassifier().to(device)
model.load_state_dict(torch.load("./Model/food_classifier_vit.pth", map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(BytesIO(image_data)).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)
    labels = ["Food", "Non-Food"]
    return {"prediction": labels[predicted.item()]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
