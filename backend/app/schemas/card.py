from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    position: Optional[int] = 0
    due_date: Optional[datetime] = None
    labels: Optional[str] = None  # JSON string of label IDs


class CardCreate(CardBase):
    list_id: int


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    due_date: Optional[datetime] = None
    labels: Optional[str] = None
    list_id: Optional[int] = None  # For moving cards


class CardMove(BaseModel):
    list_id: int
    position: int


class CardResponse(CardBase):
    id: int
    list_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
