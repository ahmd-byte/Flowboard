from pydantic import BaseModel
from typing import Optional, Dict, Any


class AutomationBase(BaseModel):
    trigger_type: str
    action_type: str
    config: Optional[Dict[str, Any]] = None


class AutomationCreate(AutomationBase):
    board_id: int


class AutomationUpdate(BaseModel):
    trigger_type: Optional[str] = None
    action_type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class AutomationResponse(AutomationBase):
    id: int
    board_id: int
    
    class Config:
        from_attributes = True

