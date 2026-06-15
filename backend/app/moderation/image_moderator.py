from dataclasses import dataclass

from app.ml_dl.image_predictor import predict_image_label
from app.moderation.labels import (
    IMAGE_TO_MODERATION_LABEL,
    ImageModerationLabel,
    ModerationLabel,
)


@dataclass(frozen=True)
class ImageModerationResult:
    raw_label: ImageModerationLabel
    moderation_label: ModerationLabel
    confidence: float


def moderate_image(image_path: str) -> ImageModerationResult:
    prediction = predict_image_label(image_path)
    raw_label = prediction.get("label")
    confidence = float(prediction.get("confidence", 0.0))

    if raw_label not in IMAGE_TO_MODERATION_LABEL:
        raise ValueError(f"Unsupported image moderation label: {raw_label}")

    return ImageModerationResult(
        raw_label=raw_label,
        moderation_label=IMAGE_TO_MODERATION_LABEL[raw_label],
        confidence=confidence
    )

