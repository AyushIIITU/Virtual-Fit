import torch
import torchvision.transforms as transforms
from PIL import Image
import torch.nn as nn
import timm
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
class FoodClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.model = timm.create_model('vit_base_patch16_224', pretrained=False)
        self.model.head = nn.Linear(self.model.head.in_features, num_classes)

    def forward(self, x):
        return self.model(x)

model = FoodClassifier().to(device)
model.load_state_dict(torch.load("./models/food_classifier_vit.pth", map_location=device))
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

async def classify_image_file(file_path: str):
    """Classify the image at the given file path."""
    image = Image.open(file_path).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)
    labels = ["Food", "Non-Food"]
    return {"prediction": labels[predicted.item()]}