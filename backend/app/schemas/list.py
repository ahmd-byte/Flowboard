from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ListBase(BaseModel):
    title: str
    position: Optional[int] = 0


class ListCreate(ListBase):
    board_id: int


class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None


class ListResponse(ListBase):
    id: int
    board_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ListWithCards(ListResponse):
    cards: List["CardResponse"] = []


# Forward reference
from app.schemas.card import CardResponse
ListWithCards.model_rebuild()

