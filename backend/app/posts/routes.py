import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends
)

from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.posts.models import Post

from app.models.like_model import Like
from app.auth.dependencies import get_current_user

from app.ml_dl.label_mapping import LABEL_MAPPING
from app.moderation.service import moderate_post
from typing import Optional

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


# DB dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/")
async def create_post(
    content: str = Form(...),

    image: Optional[UploadFile] = File(default=None),

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)
):
    image_url = None

    # save image
    if image:
        filename = (
            f"{uuid.uuid4()}-"
            f"{image.filename}"
        )

        filepath = f"uploads/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

        image_url = f"/uploads/{filename}"

    moderation_result = moderate_post(
        text=content,
        image_path=filepath if image else None
    )

    new_post = Post(
        content=content,
        image_url=image_url,
        user_id=current_user["sub"],
        sentiment=moderation_result.text_score,
        text_label=moderation_result.text_label,
        image_label=moderation_result.image_label,
        final_label=moderation_result.final_label
    )

    db.add(new_post)

    db.commit()

    db.refresh(new_post)

    return {
        "id": new_post.id,
        "content": new_post.content,
        "image_url": new_post.image_url,
        "sentiment": new_post.sentiment,
        "text_label": new_post.text_label,
        "image_label": new_post.image_label,
        "final_label": new_post.final_label
    }

@router.get("/")
def get_posts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    posts = db.query(Post).order_by(Post.created_at.desc()).all()

    result = []

    current_user_id = int(current_user["sub"])

    for post in posts:

        likes_count = db.query(Like).filter(
            Like.post_id == post.id
        ).count()

        liked = db.query(Like).filter(
            Like.post_id == post.id,
            Like.user_id == current_user_id
        ).first() is not None

        text_label = post.text_label or LABEL_MAPPING.get(post.sentiment)
        final_label = post.final_label or text_label

        result.append({
            "id": post.id,
            "content": post.content,
            "image_url": post.image_url,
            "created_at": post.created_at,
            "user_id": post.user_id,

            "sentiment": post.sentiment,
            "text_label": text_label,
            "image_label": post.image_label,
            "final_label": final_label,

            "likes_count": likes_count,
            "liked": liked,
            "username": post.user.username
        })

    return result
