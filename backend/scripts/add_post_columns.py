r"""
Safe script to add missing columns to the `posts` table used by the demo project.
Run this from the `backend` folder after activating your backend venv (or ML venv if you run DB access there):

PowerShell example:
  .\venv\Scripts\Activate.ps1
  python scripts\add_post_columns.py

The script connects using DATABASE_URL from backend/.env and executes ALTER TABLE ... IF NOT EXISTS,
so it is idempotent and safe for repeated runs. Existing data is preserved.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# load .env from repo backend folder
env_path = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise SystemExit('DATABASE_URL not found in backend/.env')

engine = create_engine(DATABASE_URL)

sql_statements = [
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS text_label VARCHAR;",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_label VARCHAR;",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS final_label VARCHAR;",
]

with engine.begin() as conn:
    for stmt in sql_statements:
        print('Executing:', stmt)
        conn.exec_driver_sql(stmt)

print('Done. Restart your backend (uvicorn) and try again.')
