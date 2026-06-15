from app.moderation.labels import LABEL_PRIORITY, ModerationLabel


def fuse_labels(labels: list[ModerationLabel]) -> ModerationLabel:
    if not labels:
        return "clean"

    return max(
        labels,
        key=lambda label: LABEL_PRIORITY[label]
    )

