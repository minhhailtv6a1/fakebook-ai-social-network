from pydantic import BaseModel
from typing import Optional

class PostCreate(BaseModel):
    content: str

class PostResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str]
    sentiment: Optional[int] = None
    text_label: Optional[str] = None
    image_label: Optional[str] = None
    final_label: Optional[str] = None

    class Config:
        from_attributes = True
