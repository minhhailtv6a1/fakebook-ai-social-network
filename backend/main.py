from fastapi import FastAPI

from app.database.database import engine, Base

from app.models.user import User
from app.posts.models import Post
from app.models.like_model import Like

from app.auth.routes import router as auth_router

from fastapi.middleware.cors import CORSMiddleware

from app.posts.routes import router as post_router

from fastapi.staticfiles import StaticFiles

from app.posts.like_routes import router as like_router

from app.users.routes import router as user_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post_router)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

@app.get("/")
def root():
    return {
        "message": "API running"
    }

app.include_router(like_router)

app.include_router(user_router)