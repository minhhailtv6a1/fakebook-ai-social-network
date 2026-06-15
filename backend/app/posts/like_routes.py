from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.like_model import Like
from app.posts.models import Post
from app.models.user import User

from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/likes", tags=["Likes"])


@router.post("/{post_id}")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user["sub"]
    ).first()

    # unlike
    if existing_like:
        db.delete(existing_like)
        db.commit()

        total_likes = db.query(Like).filter(
            Like.post_id == post_id
        ).count()

        return {
            "liked": False,
            "total_likes": total_likes
        }

    # like
    new_like = Like(
        post_id=post_id,
        user_id=current_user["sub"]
    )

    db.add(new_like)
    db.commit()

    total_likes = db.query(Like).filter(
        Like.post_id == post_id
    ).count()

    return {
        "liked": True,
        "total_likes": total_likes
    }