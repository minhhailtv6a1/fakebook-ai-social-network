from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.database.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    content = Column(Text, nullable=False)

    image_url = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    sentiment = Column(Integer)

    text_label = Column(String, nullable=True)

    image_label = Column(String, nullable=True)

    final_label = Column(String, nullable=True)
    
    # relationship
    user = relationship("User", back_populates="posts")
