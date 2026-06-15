from typing import Literal

ModerationLabel = Literal["clean", "offensive", "hate", "scam"]
ImageModerationLabel = Literal["non-violence", "violence"]

LABEL_PRIORITY: dict[ModerationLabel, int] = {
    "clean": 0,
    "offensive": 1,
    "scam": 2,
    "hate": 3,
}

IMAGE_TO_MODERATION_LABEL: dict[ImageModerationLabel, ModerationLabel] = {
    "non-violence": "clean",
    "violence": "offensive",
}

