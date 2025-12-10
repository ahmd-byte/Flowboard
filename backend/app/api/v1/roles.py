from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List as PyList
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.db.models import User, Role, RoleType, Board
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.core.jwt import get_current_user
from app.tasks.notifications import notify_member_invited_sync

router = APIRouter(prefix="/roles", tags=["Roles"])


class InviteMember(BaseModel):
    email: EmailStr
    role: RoleType = RoleType.EDITOR


class MemberResponse(BaseModel):
    id: int
    user_id: int
    board_id: int
    role: RoleType
    user_name: str
    user_email: str
    
    class Config:
        from_attributes = True


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


@router.get("/board/{board_id}/members")
def get_board_members(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a board with user details"""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Get roles
    roles = db.query(Role).filter(Role.board_id == board_id).all()
    
    members = []
    
    # Add workspace owner
    owner = db.query(User).filter(User.id == board.workspace.owner_id).first()
    if owner:
        members.append({
            "id": 0,
            "user_id": owner.id,
            "board_id": board_id,
            "role": "owner",
            "user_name": owner.name,
            "user_email": owner.email
        })
    
    # Add members with roles
    for role in roles:
        user = db.query(User).filter(User.id == role.user_id).first()
        if user:
            members.append({
                "id": role.id,
                "user_id": user.id,
                "board_id": board_id,
                "role": role.role.value,
                "user_name": user.name,
                "user_email": user.email
            })
    
    return members


@router.post("/board/{board_id}/invite", status_code=status.HTTP_201_CREATED)
def invite_member(
    board_id: int,
    invite_data: InviteMember,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invite a user to a board by email"""
    board = check_admin_access(db, board_id, current_user.id)
    
    # Find user by email
    user = db.query(User).filter(User.email == invite_data.email).first()
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User not found. They need to register first."
        )
    
    # Check if already a member
    existing = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this board")
    
    # Check if user is the owner
    if board.workspace.owner_id == user.id:
        raise HTTPException(status_code=400, detail="User is the board owner")
    
    # Create role
    role = Role(
        user_id=user.id,
        board_id=board_id,
        role=invite_data.role
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    
    # Send invitation email (async)
    background_tasks.add_task(
        notify_member_invited_sync,
        board_id,
        user.email,
        current_user.id
    )
    
    return {
        "message": f"Successfully invited {user.name} to {board.title}",
        "role_id": role.id,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "role": invite_data.role.value
    }


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
