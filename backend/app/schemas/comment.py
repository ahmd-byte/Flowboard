from pydantic import BaseModel
from datetime import datetime


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    card_id: int


class CommentResponse(CommentBase):
    id: int
    card_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

