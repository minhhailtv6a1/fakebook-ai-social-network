from PIL import Image
import torch
import torchvision
from torchvision import transforms

from app.ml_dl.violence_detect_vision_model import model

LABEL_MAPPING = {
    0: "non-violence",
    1: "violence"
}

mean = [0.4002993, 0.37603003, 0.3600476]
std = [0.22226045, 0.21355577, 0.21133435]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=mean, std=std)
])


def transform_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = transform(image)
    return image


def predict_image_label(image_path: str):

    image = transform_image(image_path)

    image = image.unsqueeze(0)

    with torch.no_grad():
        outputs = model(image)

        probs = torch.softmax(outputs, dim=1)

    predicted_class = torch.argmax(probs, dim=1).item()

    confidence = probs[0][predicted_class].item()

    return {
        "label": LABEL_MAPPING[predicted_class],
        "confidence": round(confidence, 4)
    }