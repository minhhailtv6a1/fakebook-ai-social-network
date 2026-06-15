import torch
from transformers import AutoTokenizer
from app.ml_dl.PhoBert_Model import PhoBert

MODEL_PATH = "app/ml_dl/best_phobert_model.pth"

# tokenizer from the same pretrained backbone used for training
tokenizer = AutoTokenizer.from_pretrained(
    "vinai/phobert-base"
)

# Attempt to load a saved object. The checkpoint may be either:
# - a full model object (saved with torch.save(model))
# - a state dict (torch.save(model.state_dict()))
# - a checkpoint dict that contains the state dict under keys like 'model_state_dict' or 'state_dict'
# We handle these cases and instantiate the model architecture when needed.

def _load_model_from_checkpoint(path: str, backbone: str = "vinai/phobert-base", num_labels: int = 2):
    loaded = torch.load(path, map_location="cpu")

    # If the loaded object is already a model instance, return it
    # (common when someone saved the full model object directly)
    if hasattr(loaded, "eval") and not isinstance(loaded, dict):
        return loaded

    # Otherwise we expect a state dict (possibly nested)
    state_dict = None
    if isinstance(loaded, dict):
        # Common nesting keys
        if "model_state_dict" in loaded:
            state_dict = loaded["model_state_dict"]
        elif "state_dict" in loaded:
            state_dict = loaded["state_dict"]
        else:
            # assume the dict is the state_dict itself
            state_dict = loaded

    if state_dict is None:
        raise RuntimeError("Unrecognized checkpoint format when loading model")

    # Instantiate a model architecture matching what was used in training.
    # IMPORTANT: set num_labels to the same value used during training.
    model = PhoBert(num_classes=num_labels)

    # Load weights; use strict=False to allow some mismatch in key names
    model.load_state_dict(state_dict, strict=False)
    return model

# Try to load model; adjust `num_labels` if your trained model used different number of classes
try:
    model = _load_model_from_checkpoint(MODEL_PATH, backbone="vinai/phobert-base", num_labels=4)
except Exception as e:
    # If loading fails, raise a clearer error to help debugging
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

model.eval()