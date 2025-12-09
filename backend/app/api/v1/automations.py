from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as PyList
from app.db.session import get_db
from app.db.models import User, Automation, Board, Role, RoleType
from app.schemas.automation import AutomationCreate, AutomationUpdate, AutomationResponse
from app.core.jwt import get_current_user

router = APIRouter(prefix="/automations", tags=["Automations"])


def check_board_admin(db: Session, board_id: int, user_id: int):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    is_owner = board.workspace.owner_id == user_id
    role = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == user_id,
        Role.role == RoleType.ADMIN
    ).first()
    
    if not is_owner and not role:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return board


@router.get("/board/{board_id}", response_model=PyList[AutomationResponse])
def get_automations(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_board_admin(db, board_id, current_user.id)
    automations = db.query(Automation).filter(Automation.board_id == board_id).all()
    return automations


@router.post("/", response_model=AutomationResponse, status_code=status.HTTP_201_CREATED)
def create_automation(
    automation_data: AutomationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_board_admin(db, automation_data.board_id, current_user.id)
    
    automation = Automation(**automation_data.model_dump())
    db.add(automation)
    db.commit()
    db.refresh(automation)
    return automation


@router.put("/{automation_id}", response_model=AutomationResponse)
def update_automation(
    automation_id: int,
    automation_data: AutomationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    automation = db.query(Automation).filter(Automation.id == automation_id).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    check_board_admin(db, automation.board_id, current_user.id)
    
    for key, value in automation_data.model_dump(exclude_unset=True).items():
        setattr(automation, key, value)
    
    db.commit()
    db.refresh(automation)
    return automation


@router.delete("/{automation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_automation(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    automation = db.query(Automation).filter(Automation.id == automation_id).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    check_board_admin(db, automation.board_id, current_user.id)
    
    db.delete(automation)
    db.commit()

