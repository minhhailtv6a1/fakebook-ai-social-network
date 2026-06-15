from dataclasses import dataclass

from app.ml_dl.label_mapping import LABEL_MAPPING
from app.ml_dl.predictor import predict_sentiment
from app.moderation.labels import ModerationLabel


@dataclass(frozen=True)
class TextModerationResult:
    score: int
    label: ModerationLabel


def moderate_text(text: str) -> TextModerationResult:
    score = predict_sentiment(text)
    label = LABEL_MAPPING.get(score)

    if label not in {"clean", "offensive", "hate", "scam"}:
        raise ValueError(f"Unsupported text moderation label: {label}")

    return TextModerationResult(
        score=score,
        label=label
    )

