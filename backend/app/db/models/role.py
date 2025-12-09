from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class RoleType(str, enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    role = Column(Enum(RoleType), default=RoleType.VIEWER)
    
    # Relationships
    user = relationship("User", back_populates="roles")
    board = relationship("Board", back_populates="roles")

