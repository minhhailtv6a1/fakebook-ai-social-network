from dataclasses import dataclass
from typing import Optional

from app.moderation.fusion import fuse_labels
from app.moderation.image_moderator import moderate_image
from app.moderation.labels import ImageModerationLabel, ModerationLabel
from app.moderation.text_moderator import moderate_text


@dataclass(frozen=True)
class PostModerationResult:
    text_score: int
    text_label: ModerationLabel
    image_label: Optional[ImageModerationLabel]
    final_label: ModerationLabel


def moderate_post(text: str, image_path: Optional[str] = None) -> PostModerationResult:
    text_result = moderate_text(text)
    labels_for_fusion: list[ModerationLabel] = [text_result.label]
    image_label: Optional[ImageModerationLabel] = None

    if image_path:
        image_result = moderate_image(image_path)
        image_label = image_result.raw_label
        labels_for_fusion.append(image_result.moderation_label)

    return PostModerationResult(
        text_score=text_result.score,
        text_label=text_result.label,
        image_label=image_label,
        final_label=fuse_labels(labels_for_fusion)
    )

