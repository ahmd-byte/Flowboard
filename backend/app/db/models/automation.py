from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Automation(Base):
    __tablename__ = "automations"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    trigger_type = Column(String(100), nullable=False)  # e.g., "card_moved", "due_date_passed"
    action_type = Column(String(100), nullable=False)   # e.g., "move_card", "send_notification"
    config = Column(JSON, nullable=True)  # Additional configuration
    
    # Relationships
    board = relationship("Board", back_populates="automations")

