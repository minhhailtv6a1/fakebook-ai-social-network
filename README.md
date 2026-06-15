# Intelligent Social Media Demo — Project Overview

This document describes the purpose, architecture, and file/module responsibilities of the Intelligent Social Media demo project. It focuses on implemented modules and how they connect: the FastAPI backend, the ML moderation check (PhoBert-based), and the Next.js frontend.

---

## 1. Project Summary

A small-scale social network demo where users can register/login, post content, and interact (like) with posts. When a user creates a post, the content is checked by a trained PhoBert-based classifier (`best_phobert_model.pth`) to decide whether the post meets moderation criteria. The system is split into two main parts:

- Backend: FastAPI application exposing REST endpoints for auth, posts, likes, and a ML-based moderation predictor.
- Frontend: Next.js (app router) React UI for registration, login, feed and post creation, using client-side fetch to the backend API.

This is a demo academic capstone project and the ML model is used as a simple content filter during post creation.

---

## 2. High-level architecture

- Frontend (Next.js) communicates with Backend (FastAPI) over HTTP/JSON.
- Backend persists users, posts, and likes in a relational DB via SQLAlchemy.
- On post creation, the backend calls the ML predictor to obtain a moderation decision.
- ML code is isolated in `backend/app/ml_dl/` and can be installed/run in a separate ML virtual environment (to avoid heavy ML dependencies in the main backend venv).

---

## 3. Backend — key folders & files (implementation-focused)

Path: `backend/`

- `main.py` — Application entry point. Creates DB metadata and includes routers for auth and posts. Adds CORS middleware and serves uploaded static files from `/uploads`.

- `app/database/database.py` — SQLAlchemy engine, `SessionLocal`, and `Base`. Loads `DATABASE_URL` from `.env` and provides `get_db()` generator for dependency injection.

- `app/models/` — SQLAlchemy models for domain objects:
  - `models/user.py` — `User` model (id, username, email, password_hash, created_at).
  - `models/like_model.py` — `Like` model for post interactions.

- `app/schemas/` — Pydantic schemas for validation and response models (e.g. `user_schema.py`). Note: `orm_mode` is used to allow returning SQLAlchemy objects.

- `app/auth/`
  - `routes.py` — Endpoints for registration (`/auth/register`), login (`/auth/login`) and `/auth/me` protected endpoint. Uses password hashing and JWT creation.
  - `dependencies.py` — Token verification dependency (extracts `Authorization: Bearer <token>` and decodes JWT). Recommended to convert payload `sub` into a DB user lookup.

- `app/posts/`
  - `routes.py` — Post CRUD endpoints; on creation it calls the ML predictor to check content.
  - `models.py` and `schemas.py` — Post model and pydantic schemas.
  - `like_routes.py` — Endpoints for liking and unliking posts.

- `app/ml_dl/` — ML modules (kept separate to minimize heavy deps in main venv):
  - `sentiment_model.py` — Loader and helper for the PhoBert model. Handles multiple checkpoint formats (full model object or state_dict). Instantiates `PhoBert` architecture and loads state.
  - `PhoBert_Model.py` — Local custom model definition using `transformers.AutoModel` and a small classifier head (Dropout + Linear layers). Defines `PhoBert(nn.Module)`.
  - `predictor.py` — Thin wrapper that tokenizes input text and runs the `model` to return predicted class index. Used by `app/posts/routes.py`.
  - `best_phobert_model.pth` (or `best_model.pt`) — trained checkpoint file (not included here) expected at `app/ml_dl/`.

- `requirements.txt` — Lightweight backend deps (fastapi, uvicorn, sqlalchemy, psycopg2-binary, passlib, bcrypt, python-dotenv, email-validator, etc.).
- `ml-requirements.txt` — ML-specific packages (transformers, tokenizers, sentencepiece, and instruction to install torch separately using the official PyTorch index). This keeps heavy ML packages isolated.

---

## 4. Frontend — key folders & files

Path: `frontend/`

- `app/` (Next.js app router)
  - `layout.tsx` — Base layout used by pages.
  - `globals.css` — Global styling, input contrast fixes and notification CSS (fixed top-right sliding notification with `.notif` and `.notif.hide` classes).
  - `login/page.tsx` — Client component for login: sends credentials to `/auth/login`, saves token to `localStorage`, and shows sliding notifications with the exact Vietnamese messages requested (success: "Đăng nhập thành công", error: "Email hoặc tài khoản không đúng!").
  - `feed/page.tsx` — Client component for the protected feed; waits for client mount (`isMounted`) to avoid SSR/CSR hydration mismatch, fetches `/auth/me` with the token and shows user data or "Not signed in".

- `lib/api.ts` — Thin API helper that forwards requests to the backend base URL.
- `next.config.ts` — Next.js config. During development, `allowedDevOrigins` may need to include LAN IPs for HMR when accessing the app via network host.

---

## 5. ML integration details

- ML files live under `backend/app/ml_dl/`.
- `PhoBert_Model.PhoBert` defines the architecture built on `vinai/phobert-base` with a classifier head. It expects tokenized inputs (`input_ids`, `attention_mask`) and returns logits.
- `sentiment_model.py` prefers to load a full model object; if checkpoint is a state_dict, it instantiates the architecture and calls `load_state_dict(..., strict=False)`.
- `predictor.py` tokenizes input with `AutoTokenizer.from_pretrained("vinai/phobert-base")` and calls `model(**inputs)`, returning the predicted class index.
- To avoid heavy dependencies in the backend venv, the ML stack (torch, transformers with certain versions) is installed in the separate ML venv using `ml-requirements.txt` and the recommended PyTorch installer command.

---

## 6. How components interact when creating a post

1. Frontend sends POST /posts with text and optional media.
2. Backend `app.posts.routes` receives request and validates it with pydantic schemas.
3. The route calls `app.ml_dl.predictor.predict_sentiment(text)`.
4. `predict_sentiment` tokenizes the text and runs the model to get predicted class.
5. Backend applies moderation logic based on prediction (accept/reject or flag), saves the post to DB if allowed, and returns response to frontend.

---

## 7. Run & development notes

- Backend (API):
  - Use the lightweight backend venv for normal API work:
    1. cd backend
    2. python -m venv venv
    3. .\venv\Scripts\Activate.ps1 (PowerShell) or source venv/Scripts/activate (Git Bash)
    4. python -m pip install -r requirements.txt
    5. python -m uvicorn main:app --reload

- ML environment (separate):
  - Create ML venv (Python 3.11 recommended), activate it, install PyTorch using official index (CPU or CUDA), then:
    python -m pip install -r ml-requirements.txt
  - Ensure this ML venv is used when you run the backend service that must load the model. Alternatively, run model-serving in a separate process communicating by HTTP.

- Frontend:
  - cd frontend
  - npm install
  - npm run dev
  - If accessing the dev server via LAN IP, add that origin to `allowedDevOrigins` in `next.config.ts`.

---

## 8. Known issues & recommendations

- The ML code may raise `ModuleNotFoundError` if the relative import path for `PhoBert_Model` is incorrect. Ensure `app/ml_dl/PhoBert_Model.py` exists and contains class `PhoBert` (present in this repo).
- The model checkpoint format matters: if the checkpoint only contains `state_dict`, `sentiment_model.py` instantiates the architecture and loads weights; ensure `num_classes` matches training.
- Keep heavy ML deps out of the main backend venv. Use `ml-requirements.txt` and the PyTorch wheel index to avoid build-from-source issues (tokenizers builds may require Rust if wheels are unavailable).
- For production, implement authentication checks for protected endpoints, secure SECRET_KEY, and do not load large models in-process in a synchronous request handler — use a separate model server or async background tasks.

---

## 9. Next steps & extension ideas

- Convert token payload into a DB user object in `auth/dependencies.py` to provide `current_user` objects to routes.
- Implement more granular moderation policies and multi-label outputs from the ML model.
- Move ML inference to a dedicated service (e.g., FastAPI model server) and call it from the main API to reduce memory footprint.
- Add pagination, media-processing pipelines, and richer reactions (comments, bookmarks).

---

## 10. Where to look in the codebase (quick map)

- backend/main.py — app wiring and routers
- backend/app/database/database.py — DB engine and session
- backend/app/models/_ and backend/app/schemas/_ — DB models & pydantic schemas
- backend/app/auth/\* — authentication routes and dependencies
- backend/app/posts/\* — post endpoints, schemas, like routes
- backend/app/ml_dl/\* — ML code: `PhoBert_Model.py`, `sentiment_model.py`, `predictor.py`, model checkpoint
- frontend/app/\* — Next.js app pages (`login`, `feed`), `globals.css` for UI styles

---

If you want, I can also generate a shorter README for repository root, or produce a diagram (ASCII) showing interactions. Which output do you prefer next?
