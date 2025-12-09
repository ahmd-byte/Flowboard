from pydantic import BaseModel
from typing import Optional
from app.db.models.role import RoleType


class RoleBase(BaseModel):
    role: RoleType = RoleType.VIEWER


class RoleCreate(RoleBase):
    user_id: int
    board_id: int


class RoleUpdate(BaseModel):
    role: RoleType


class RoleResponse(RoleBase):
    id: int
    user_id: int
    board_id: int
    
    class Config:
        from_attributes = True

