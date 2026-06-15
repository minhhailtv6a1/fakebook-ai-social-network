import torchvision
from torchvision import transforms
import torch
import torch.nn as nn
import torch.optim as optim

MODEL_PATH = "app/ml_dl/best_densenet_model.pth"

# Define the model architecture (must match what was used in training)
weights = torchvision.models.DenseNet201_Weights.IMAGENET1K_V1
model = torchvision.models.densenet201(weights=weights)
model.classifier = nn.Linear(model.classifier.in_features, 2)

# Load the saved model weights
try:
    checkpoint = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

model.eval()