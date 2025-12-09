from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    workspaces = relationship("Workspace", back_populates="owner")
    roles = relationship("Role", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    activities = relationship("Activity", back_populates="user")

