from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    card = relationship("Card", back_populates="comments")
    user = relationship("User", back_populates="comments")

