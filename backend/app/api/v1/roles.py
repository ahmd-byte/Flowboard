from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as PyList
from app.db.session import get_db
from app.db.models import User, Role, RoleType, Board
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.core.jwt import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles"])


def check_admin_access(db: Session, board_id: int, user_id: int):
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


@router.get("/board/{board_id}", response_model=PyList[RoleResponse])
def get_board_roles(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin_access(db, board_id, current_user.id)
    roles = db.query(Role).filter(Role.board_id == board_id).all()
    return roles


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def assign_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin_access(db, role_data.board_id, current_user.id)
    
    # Check if role already exists
    existing = db.query(Role).filter(
        Role.board_id == role_data.board_id,
        Role.user_id == role_data.user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already has a role on this board")
    
    role = Role(**role_data.model_dump())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    check_admin_access(db, role.board_id, current_user.id)
    
    role.role = role_data.role
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    check_admin_access(db, role.board_id, current_user.id)
    
    db.delete(role)
    db.commit()

