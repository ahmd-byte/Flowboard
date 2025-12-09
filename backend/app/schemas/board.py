from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class BoardBase(BaseModel):
    title: str
    background: Optional[str] = "bg-gradient-to-br from-blue-500 to-indigo-600"


class BoardCreate(BoardBase):
    workspace_id: int


class BoardUpdate(BaseModel):
    title: Optional[str] = None
    background: Optional[str] = None


class BoardResponse(BoardBase):
    id: int
    workspace_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BoardWithLists(BoardResponse):
    lists: List["ListResponse"] = []


# Forward reference
from app.schemas.list import ListResponse
BoardWithLists.model_rebuild()

