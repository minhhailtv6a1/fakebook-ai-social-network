# Fakebook

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![PyTorch](https://img.shields.io/badge/AI-PyTorch-ee4c2c)

Fakebook is a university capstone social network prototype that combines a Facebook-inspired news feed with AI-assisted content moderation for Vietnamese text and uploaded images.

## Overview

Fakebook demonstrates how a full-stack social media application can integrate machine learning into the posting workflow. Users can register, log in, create posts, upload images, view a news feed, and like/unlike posts. When a post is created, the backend runs text moderation with a PhoBERT-based classifier and image moderation with a DenseNet201-based violence classifier. The moderation outputs are saved with the post and displayed in the feed.

The project focuses on two engineering areas:

- **Full-stack engineering:** Next.js frontend, FastAPI backend, PostgreSQL persistence, JWT authentication, file upload, and REST APIs.
- **AI integration:** text classification, image classification, label fusion, and user-facing moderation warnings.

## Features

| Feature                                   | Status                 |
| ----------------------------------------- | ---------------------- |
| User registration                         | ✅ Implemented         |
| User login                                | ✅ Implemented         |
| JWT authentication                        | ✅ Implemented         |
| Current user profile endpoint             | ✅ Implemented         |
| Create text post                          | ✅ Implemented         |
| Upload image with post                    | ✅ Implemented         |
| News feed                                 | ✅ Implemented         |
| Like / unlike post                        | ✅ Implemented         |
| Text moderation with PhoBERT              | ✅ Implemented         |
| Image moderation with DenseNet201         | ✅ Implemented         |
| Label fusion for final moderation label   | ✅ Implemented         |
| Moderation labels in feed                 | ✅ Implemented         |
| Violence image warning overlay            | ✅ Implemented         |
| Loading skeletons and toast notifications | ✅ Implemented         |
| Model training notebooks                  | ✅ Implemented         |
| Manual database migration script          | ✅ Implemented         |
| Admin dashboard                           | 🚧 Not implemented     |
| Comments                                  | 🚧 Not implemented     |
| Messenger                                 | 🚧 Not implemented     |
| Search                                    | 🚧 UI placeholder only |
| Notifications                             | 🚧 UI placeholder only |

## System Architecture

```text
User Browser
  |
  v
Next.js Frontend
  |
  | Axios HTTP requests
  v
FastAPI Backend
  |
  | SQLAlchemy ORM
  v
PostgreSQL Database

FastAPI Post Creation Flow
  |
  +--> PhoBERT text moderation
  |
  +--> DenseNet201 image moderation, if image exists
  |
  +--> Label fusion
  |
  +--> Save post and moderation labels
```

### Frontend

The frontend is a Next.js App Router application. It includes:

- `/login` page with login and registration modal.
- `/feed` page with a Facebook-like feed layout.
- Axios API client with JWT bearer token injection.
- Reusable UI helpers for avatar, toast, and skeleton loading states.
- Moderation labels and a violence image warning overlay in the feed.

### Backend

The backend is a FastAPI application. It includes routers for:

- Authentication
- Current user information
- Posts
- Likes

The backend serves uploaded files from `/uploads` and uses SQLAlchemy for PostgreSQL persistence.

### Database

The database is PostgreSQL. SQLAlchemy models currently include:

- `User`
- `Post`
- `Like`

The `posts` table stores post content, optional image URL, author ID, creation time, legacy sentiment score, and moderation labels.

### AI Moderation Layer

AI logic is kept outside route handlers:

- `backend/app/ml_dl/` contains model loading and low-level prediction code.
- `backend/app/moderation/` contains moderation wrappers, label mapping, and fusion logic.

This separation keeps API routes focused on request handling while the moderation layer owns AI behavior.

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- TailwindCSS 4
- Axios
- Lucide React

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- psycopg2
- JWT with `python-jose`
- Passlib + bcrypt
- python-multipart
- python-dotenv

### AI / ML

- PyTorch
- TorchVision
- HuggingFace Transformers
- PhoBERT (`vinai/phobert-base`)
- DenseNet201
- Pillow
- NumPy
- scikit-learn
- pandas

## Repository Structure

```text
.
├── README.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── ml-requirements.txt
│   ├── migrations/
│   │   └── 20260613_add_post_moderation_labels.sql
│   ├── scripts/
│   │   └── add_post_columns.py
│   ├── uploads/
│   └── app/
│       ├── auth/
│       │   ├── dependencies.py
│       │   └── routes.py
│       ├── core/
│       │   └── security.py
│       ├── database/
│       │   └── database.py
│       ├── ml_dl/
│       │   ├── PhoBert_Model.py
│       │   ├── image_predictor.py
│       │   ├── label_mapping.py
│       │   ├── predictor.py
│       │   ├── sentiment_model.py
│       │   └── violence_detect_vision_model.py
│       ├── models/
│       │   ├── like_model.py
│       │   └── user.py
│       ├── moderation/
│       │   ├── fusion.py
│       │   ├── image_moderator.py
│       │   ├── labels.py
│       │   ├── service.py
│       │   └── text_moderator.py
│       ├── posts/
│       │   ├── like_routes.py
│       │   ├── models.py
│       │   ├── routes.py
│       │   └── schemas.py
│       ├── schemas/
│       │   └── user_schema.py
│       └── users/
│           └── routes.py
├── frontend/
│   ├── app/
│   │   ├── feed/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── Skeleton.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── errors.ts
│   │   └── types.ts
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
└── model-training/
    ├── language-model/
    │   ├── create_final_sentiment_dataset.ipynb
    │   └── training_model_for_HATE_SCAM_SPAM_Status_Sentiment.ipynb
    └── vision-model/
        └── training_model_for_Violence_Detection.ipynb
```

<!-- > Note: there is currently no `docs/` directory. -->

## AI Content Moderation Pipeline

The moderation pipeline runs when an authenticated user creates a post.

```text
User creates post
  |
  v
FastAPI receives text and optional image
  |
  +--> Save uploaded image to backend/uploads, if present
  |
  +--> Run text moderation with PhoBERT
  |
  +--> Run image moderation with DenseNet201, if image exists
  |
  +--> Fuse labels using priority:
       hate > scam > offensive > clean
  |
  +--> Save post, text_label, image_label, final_label
  |
  v
Frontend displays moderation labels in the feed
```

For violent image predictions, the feed does not immediately reveal the image. It renders a blurred image with a warning and a `View Image` button. Revealing the image only affects the selected post and does not reload the page.

## Moderation Labels

### Text Moderation

The PhoBERT text classifier maps predictions to:

- `clean`
- `offensive`
- `hate`
- `scam`

The mapping is defined in `backend/app/ml_dl/label_mapping.py`.

### Image Moderation

The DenseNet201 image classifier maps predictions to:

- `non-violence`
- `violence`

Image labels are normalized for final fusion:

| Image label    | Moderation label used for fusion |
| -------------- | -------------------------------- |
| `non-violence` | `clean`                          |
| `violence`     | `offensive`                      |

## Installation

### Prerequisites

- Python 3.11+ recommended for ML dependencies
- Node.js compatible with Next.js 16
- PostgreSQL
- A configured `.env` file in `backend/`

### Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME
SECRET_KEY=replace-with-a-secure-secret
ALGORITHM=HS256
```

Run the backend:

```powershell
python -m uvicorn main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

### Database Setup

The app uses SQLAlchemy `Base.metadata.create_all()` for initial table creation.

For existing databases, apply the moderation column migration:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python scripts\add_post_columns.py
```

Equivalent SQL:

```sql
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS text_label VARCHAR,
ADD COLUMN IF NOT EXISTS image_label VARCHAR,
ADD COLUMN IF NOT EXISTS final_label VARCHAR;
```

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:3000
```

### Frontend API Configuration

The current Axios client points to:

```text
http://127.0.0.1:8000
```

This is defined in `frontend/lib/api.ts`.

## API Overview

### Root

| Method | Path | Description                               |
| ------ | ---- | ----------------------------------------- |
| `GET`  | `/`  | Health-style root response: `API running` |

### Authentication

| Method | Path             | Description                                     |
| ------ | ---------------- | ----------------------------------------------- |
| `POST` | `/auth/register` | Register a new user                             |
| `POST` | `/auth/login`    | Login and receive JWT access token              |
| `GET`  | `/auth/me`       | Protected route returning decoded token payload |

### Users

| Method | Path        | Description                                                     |
| ------ | ----------- | --------------------------------------------------------------- |
| `GET`  | `/users/me` | Return the current authenticated user's ID, username, and email |

### Posts

| Method | Path      | Description                                                                 |
| ------ | --------- | --------------------------------------------------------------------------- |
| `POST` | `/posts/` | Create a post with text and optional image upload; runs AI moderation       |
| `GET`  | `/posts/` | Return authenticated user's feed data with like state and moderation labels |

### Likes

| Method | Path               | Description                   |
| ------ | ------------------ | ----------------------------- |
| `POST` | `/likes/{post_id}` | Toggle like/unlike for a post |

## Database Models

### User

- `id`
- `username`
- `email`
- `password_hash`
- `created_at`

### Post

- `id`
- `content`
- `image_url`
- `user_id`
- `created_at`
- `sentiment`
- `text_label`
- `image_label`
- `final_label`

### Like

- `id`
- `user_id`
- `post_id`

## Future Improvements

- Admin dashboard for moderation review and label filtering.
- Comments system.
- Messenger or real-time chat.
- Search implementation.
- Notification implementation.
- User profile pages.
- Post edit/delete controls.
- Alembic migrations instead of manual SQL scripts.
- Centralized environment configuration for frontend API base URL.
- Background or separate-service model inference for heavier AI workloads.
- Test coverage for backend APIs, frontend flows, and moderation fusion.

## Screenshots

### Login

Screenshot placeholder.

### Feed

Screenshot placeholder.

### Moderation

Screenshot placeholder.

## Author

This project was developed as a university capstone project focused on full-stack web engineering and applied AI moderation.

For portfolio review, the project demonstrates:

- End-to-end feature development across frontend and backend.
- REST API design with authentication and persistence.
- Integration of Vietnamese NLP and computer vision models into a web product.
- Practical UX decisions for AI-assisted content moderation.
