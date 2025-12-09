from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import User, Board, Workspace, Role, RoleType
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse
from app.core.jwt import get_current_user

router = APIRouter(prefix="/boards", tags=["Boards"])


@router.get("/", response_model=List[BoardResponse])
def get_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get boards where user has a role or is workspace owner
    boards = db.query(Board).join(Workspace).filter(
        (Workspace.owner_id == current_user.id) |
        (Board.id.in_(
            db.query(Role.board_id).filter(Role.user_id == current_user.id)
        ))
    ).all()
    return boards


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    board_data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify workspace ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == board_data.workspace_id,
        Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create boards in this workspace"
        )
    
    board = Board(**board_data.model_dump())
    db.add(board)
    db.commit()
    db.refresh(board)
    
    # Assign admin role to creator
    role = Role(user_id=current_user.id, board_id=board.id, role=RoleType.ADMIN)
    db.add(role)
    db.commit()
    
    return board


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Check access
    has_access = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == current_user.id
    ).first() or board.workspace.owner_id == current_user.id
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this board"
        )
    
    return board


@router.put("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    board_data: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Check admin/editor access
    role = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == current_user.id,
        Role.role.in_([RoleType.ADMIN, RoleType.EDITOR])
    ).first()
    
    if not role and board.workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this board"
        )
    
    for key, value in board_data.model_dump(exclude_unset=True).items():
        setattr(board, key, value)
    
    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Only admin or workspace owner can delete
    role = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == current_user.id,
        Role.role == RoleType.ADMIN
    ).first()
    
    if not role and board.workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this board"
        )
    
    db.delete(board)
    db.commit()

