from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Activity(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="activities")
    board = relationship("Board", back_populates="activities")

