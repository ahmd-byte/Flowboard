from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List as PyList
from app.db.session import get_db
from app.db.models import User, Card, List
from app.schemas.card import CardCreate, CardUpdate, CardMove, CardResponse
from app.core.jwt import get_current_user
from app.tasks.notifications import notify_card_created_sync, notify_card_moved_sync
from app.services.permissions import check_list_access

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.get("/list/{list_id}", response_model=PyList[CardResponse])
def get_cards(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all cards in a list.
    
    Requires access to the board containing the list.
    """
    check_list_access(db, list_id, current_user.id)
    cards = db.query(Card).filter(Card.list_id == list_id).order_by(Card.position).all()
    return cards


@router.post("/", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    card_data: CardCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new card in a list.
    
    Requires EDITOR or ADMIN role on the board.
    Sends notification to board members asynchronously.
    """
    check_list_access(db, card_data.list_id, current_user.id, require_edit=True)
    
    # Get max position
    max_pos = db.query(Card).filter(Card.list_id == card_data.list_id).count()
    
    card = Card(**card_data.model_dump())
    card.position = max_pos
    db.add(card)
    db.commit()
    db.refresh(card)
    
    # Send notification to board members (async)
    background_tasks.add_task(notify_card_created_sync, card.id, current_user.id)
    
    return card


@router.get("/{card_id}", response_model=CardResponse)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific card by ID.
    
    Requires access to the board containing the card.
    """
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    check_list_access(db, card.list_id, current_user.id)
    return card


@router.put("/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_data: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a card.
    
    Requires EDITOR or ADMIN role on the board.
    """
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    check_list_access(db, card.list_id, current_user.id, require_edit=True)
    
    for key, value in card_data.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    
    db.commit()
    db.refresh(card)
    return card


@router.put("/{card_id}/move", response_model=CardResponse)
def move_card(
    card_id: int,
    move_data: CardMove,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Move a card to a different list or position.
    
    Requires EDITOR or ADMIN role on both source and destination boards.
    Sends notification if card is moved to a different list.
    """
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check access to source list
    check_list_access(db, card.list_id, current_user.id, require_edit=True)
    # Check access to destination list
    check_list_access(db, move_data.list_id, current_user.id, require_edit=True)
    
    old_list_id = card.list_id
    old_position = card.position
    new_list_id = move_data.list_id
    new_position = move_data.position
    
    # Only notify if moving to different list
    list_changed = old_list_id != new_list_id
    
    # Remove from old position
    db.query(Card).filter(
        Card.list_id == old_list_id,
        Card.position > old_position
    ).update({Card.position: Card.position - 1})
    
    # Insert at new position
    db.query(Card).filter(
        Card.list_id == new_list_id,
        Card.position >= new_position
    ).update({Card.position: Card.position + 1})
    
    card.list_id = new_list_id
    card.position = new_position
    
    db.commit()
    db.refresh(card)
    
    # Send notification only if moved to different list (async)
    if list_changed:
        background_tasks.add_task(
            notify_card_moved_sync, 
            card.id, 
            old_list_id, 
            new_list_id, 
            current_user.id
        )
    
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a card.
    
    Requires EDITOR or ADMIN role on the board.
    """
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    check_list_access(db, card.list_id, current_user.id, require_edit=True)
    
    db.delete(card)
    db.commit()
