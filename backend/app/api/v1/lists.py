from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as PyList
from app.db.session import get_db
from app.db.models import User, List
from app.schemas.list import ListCreate, ListUpdate, ListResponse
from app.core.jwt import get_current_user
from app.services.permissions import check_board_access

router = APIRouter(prefix="/lists", tags=["Lists"])


@router.get("/board/{board_id}", response_model=PyList[ListResponse])
def get_lists(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all lists for a board.
    
    Requires access to the board (any role or workspace owner).
    Lists are returned ordered by position.
    """
    check_board_access(db, board_id, current_user.id)
    lists = db.query(List).filter(List.board_id == board_id).order_by(List.position).all()
    return lists


@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: ListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new list in a board.
    
    Requires EDITOR or ADMIN role on the board.
    The new list is automatically positioned at the end.
    """
    check_board_access(db, list_data.board_id, current_user.id, require_edit=True)
    
    # Get max position
    max_pos = db.query(List).filter(List.board_id == list_data.board_id).count()
    
    new_list = List(**list_data.model_dump())
    new_list.position = max_pos
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


@router.put("/{list_id}", response_model=ListResponse)
def update_list(
    list_id: int,
    list_data: ListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a list.
    
    Requires EDITOR or ADMIN role on the board.
    """
    list_item = db.query(List).filter(List.id == list_id).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    
    check_board_access(db, list_item.board_id, current_user.id, require_edit=True)
    
    for key, value in list_data.model_dump(exclude_unset=True).items():
        setattr(list_item, key, value)
    
    db.commit()
    db.refresh(list_item)
    return list_item


@router.put("/{list_id}/position", response_model=ListResponse)
def update_list_position(
    list_id: int,
    new_position: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the position of a list within a board.
    
    Requires EDITOR or ADMIN role on the board.
    Automatically reorders other lists to maintain sequential positions.
    """
    list_item = db.query(List).filter(List.id == list_id).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    
    check_board_access(db, list_item.board_id, current_user.id, require_edit=True)
    
    old_position = list_item.position
    
    # Reorder other lists
    if new_position > old_position:
        db.query(List).filter(
            List.board_id == list_item.board_id,
            List.position > old_position,
            List.position <= new_position
        ).update({List.position: List.position - 1})
    else:
        db.query(List).filter(
            List.board_id == list_item.board_id,
            List.position >= new_position,
            List.position < old_position
        ).update({List.position: List.position + 1})
    
    list_item.position = new_position
    db.commit()
    db.refresh(list_item)
    return list_item


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a list and all its cards.
    
    Requires EDITOR or ADMIN role on the board.
    This action cannot be undone.
    """
    list_item = db.query(List).filter(List.id == list_id).first()
    if not list_item:
        raise HTTPException(status_code=404, detail="List not found")
    
    check_board_access(db, list_item.board_id, current_user.id, require_edit=True)
    
    db.delete(list_item)
    db.commit()

