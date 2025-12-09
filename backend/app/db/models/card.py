from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, default=0)
    due_date = Column(DateTime, nullable=True)
    labels = Column(String(500), nullable=True)  # JSON string of labels
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships with cascade delete
    list = relationship("List", back_populates="cards")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan")
