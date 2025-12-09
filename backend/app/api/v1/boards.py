from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import User, Board, Workspace, Role, RoleType, List as ListModel, Card
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse
from app.core.jwt import get_current_user

router = APIRouter(prefix="/boards", tags=["Boards"])


class BoardCreateSimple(BaseModel):
    title: str
    background: Optional[str] = "bg-gradient-to-br from-blue-500 to-indigo-600"


class BoardFullResponse(BaseModel):
    id: int
    title: str
    background: str
    lists: list
    
    class Config:
        from_attributes = True


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
    board_data: BoardCreateSimple,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's default workspace (first one they own)
    workspace = db.query(Workspace).filter(
        Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        # Create default workspace if none exists
        workspace = Workspace(
            name=f"{current_user.name}'s Workspace",
            owner_id=current_user.id
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    
    board = Board(
        title=board_data.title,
        background=board_data.background,
        workspace_id=workspace.id
    )
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


@router.get("/{board_id}/full")
def get_board_full(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get board with all lists and cards"""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Check access
    has_access = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == current_user.id
    ).first() or board.workspace.owner_id == current_user.id
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get lists with cards
    lists = db.query(ListModel).filter(
        ListModel.board_id == board_id
    ).order_by(ListModel.position).all()
    
    lists_data = []
    cards_data = {}
    list_order = []
    
    for lst in lists:
        list_order.append(str(lst.id))
        cards = db.query(Card).filter(
            Card.list_id == lst.id
        ).order_by(Card.position).all()
        
        card_ids = []
        for card in cards:
            card_ids.append(str(card.id))
            cards_data[str(card.id)] = {
                "id": str(card.id),
                "list_id": str(card.list_id),
                "title": card.title,
                "description": card.description,
                "position": card.position,
                "due_date": card.due_date.isoformat() if card.due_date else None
            }
        
        lists_data.append({
            "id": str(lst.id),
            "title": lst.title,
            "position": lst.position,
            "cardIds": card_ids
        })
    
    # Convert lists_data to dict format for frontend
    lists_dict = {str(lst["id"]): lst for lst in lists_data}
    
    return {
        "board": {
            "id": board.id,
            "title": board.title,
            "background": board.background
        },
        "lists": lists_dict,
        "cards": cards_data,
        "listOrder": list_order
    }


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
