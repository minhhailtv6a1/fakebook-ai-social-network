from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.schemas.user_schema import (
    UserRegister,
    UserResponse
)
from app.core.security import hash_password

from app.schemas.user_schema import UserLogin
from app.core.security import (
    verify_password,
    create_access_token
)

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

# User Registration
@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(
            user_data.password
        )
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user

# User Login
@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    valid_password = verify_password(
        user_data.password,
        user.password_hash
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        data={
            "sub": str(user.id)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# Protected route example
@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "user": current_user
    }