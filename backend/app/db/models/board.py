from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Board(Base):
    __tablename__ = "boards"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    title = Column(String(255), nullable=False)
    background = Column(String(255), default="bg-gradient-to-br from-blue-500 to-indigo-600")
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships with cascade delete
    workspace = relationship("Workspace", back_populates="boards")
    lists = relationship("List", back_populates="board", order_by="List.position", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="board", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="board", cascade="all, delete-orphan")
    automations = relationship("Automation", back_populates="board", cascade="all, delete-orphan")
