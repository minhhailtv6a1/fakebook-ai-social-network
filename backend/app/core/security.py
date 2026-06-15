from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)


def _truncate_password(password: str, max_bytes: int = 72) -> str:
    if not isinstance(password, str):
        password = str(password)
    b = password.encode('utf-8', errors='ignore')
    if len(b) <= max_bytes:
        return password
    # truncate to max_bytes and decode safely
    return b[:max_bytes].decode('utf-8', errors='ignore')


def hash_password(password: str):
    password = _truncate_password(password)
    return pwd_context.hash(password)


def verify_password(
    plain_password,
    hashed_password
):
    plain_password = _truncate_password(plain_password)
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("PAYLOAD:", payload)

        return payload

    except JWTError as e:
        print("JWT ERROR:", e)

        return None