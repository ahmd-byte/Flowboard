from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class List(Base):
    __tablename__ = "lists"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    title = Column(String(255), nullable=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships with cascade delete
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", order_by="Card.position", cascade="all, delete-orphan")
