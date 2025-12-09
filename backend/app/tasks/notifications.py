from app.tasks.celery_app import celery_app
from app.services.email_service import (
    email_service,
    card_created_email,
    card_moved_email,
    member_invited_email
)
from app.db.session import SessionLocal
from app.db.models import Board, User, Role, List as ListModel, Card
from typing import List
import os


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def get_board_member_emails(db, board_id: int, exclude_user_id: int = None) -> List[str]:
    """Get emails of all board members except the one who triggered the action"""
    # Get board owner
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        return []
    
    emails = []
    
    # Add workspace owner
    owner = db.query(User).filter(User.id == board.workspace.owner_id).first()
    if owner and owner.id != exclude_user_id:
        emails.append(owner.email)
    
    # Add all members with roles
    roles = db.query(Role).filter(Role.board_id == board_id).all()
    for role in roles:
        if role.user_id != exclude_user_id:
            user = db.query(User).filter(User.id == role.user_id).first()
            if user and user.email not in emails:
                emails.append(user.email)
    
    return emails


@celery_app.task(name="send_card_created_notification")
def send_card_created_notification(
    card_id: int,
    created_by_id: int
):
    """Send email notification when a card is created"""
    db = SessionLocal()
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return {"status": "error", "message": "Card not found"}
        
        list_item = db.query(ListModel).filter(ListModel.id == card.list_id).first()
        board = db.query(Board).filter(Board.id == list_item.board_id).first()
        created_by = db.query(User).filter(User.id == created_by_id).first()
        
        # Get member emails
        emails = get_board_member_emails(db, board.id, exclude_user_id=created_by_id)
        
        if not emails:
            return {"status": "skipped", "message": "No members to notify"}
        
        # Generate email
        board_url = f"{FRONTEND_URL}/board/{board.id}"
        subject, html, text = card_created_email(
            card_title=card.title,
            list_title=list_item.title,
            board_title=board.title,
            created_by=created_by.name if created_by else "Unknown",
            board_url=board_url
        )
        
        # Send email
        success = email_service.send_email(emails, subject, html, text)
        
        return {
            "status": "sent" if success else "disabled",
            "recipients": emails,
            "card": card.title
        }
        
    finally:
        db.close()


@celery_app.task(name="send_card_moved_notification")
def send_card_moved_notification(
    card_id: int,
    from_list_id: int,
    to_list_id: int,
    moved_by_id: int
):
    """Send email notification when a card is moved"""
    db = SessionLocal()
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return {"status": "error", "message": "Card not found"}
        
        from_list = db.query(ListModel).filter(ListModel.id == from_list_id).first()
        to_list = db.query(ListModel).filter(ListModel.id == to_list_id).first()
        board = db.query(Board).filter(Board.id == to_list.board_id).first()
        moved_by = db.query(User).filter(User.id == moved_by_id).first()
        
        # Get member emails
        emails = get_board_member_emails(db, board.id, exclude_user_id=moved_by_id)
        
        if not emails:
            return {"status": "skipped", "message": "No members to notify"}
        
        # Generate email
        board_url = f"{FRONTEND_URL}/board/{board.id}"
        subject, html, text = card_moved_email(
            card_title=card.title,
            from_list=from_list.title if from_list else "Unknown",
            to_list=to_list.title if to_list else "Unknown",
            board_title=board.title,
            moved_by=moved_by.name if moved_by else "Unknown",
            board_url=board_url
        )
        
        # Send email
        success = email_service.send_email(emails, subject, html, text)
        
        return {
            "status": "sent" if success else "disabled",
            "recipients": emails,
            "card": card.title
        }
        
    finally:
        db.close()


@celery_app.task(name="send_member_invited_notification")
def send_member_invited_notification(
    board_id: int,
    invited_user_email: str,
    invited_by_id: int
):
    """Send email notification when a user is invited to a board"""
    db = SessionLocal()
    try:
        board = db.query(Board).filter(Board.id == board_id).first()
        if not board:
            return {"status": "error", "message": "Board not found"}
        
        invited_by = db.query(User).filter(User.id == invited_by_id).first()
        
        # Generate email
        board_url = f"{FRONTEND_URL}/board/{board.id}"
        subject, html, text = member_invited_email(
            board_title=board.title,
            invited_by=invited_by.name if invited_by else "Someone",
            board_url=board_url
        )
        
        # Send email
        success = email_service.send_email([invited_user_email], subject, html, text)
        
        return {
            "status": "sent" if success else "disabled",
            "recipient": invited_user_email,
            "board": board.title
        }
        
    finally:
        db.close()


# Synchronous versions for when Celery is not available
def notify_card_created_sync(card_id: int, created_by_id: int):
    """Synchronous fallback when Celery is not running"""
    try:
        send_card_created_notification.delay(card_id, created_by_id)
    except Exception as e:
        print(f"[CELERY NOT AVAILABLE] Running sync: {e}")
        send_card_created_notification(card_id, created_by_id)


def notify_card_moved_sync(card_id: int, from_list_id: int, to_list_id: int, moved_by_id: int):
    """Synchronous fallback when Celery is not running"""
    try:
        send_card_moved_notification.delay(card_id, from_list_id, to_list_id, moved_by_id)
    except Exception as e:
        print(f"[CELERY NOT AVAILABLE] Running sync: {e}")
        send_card_moved_notification(card_id, from_list_id, to_list_id, moved_by_id)


def notify_member_invited_sync(board_id: int, invited_user_email: str, invited_by_id: int):
    """Synchronous fallback when Celery is not running"""
    try:
        send_member_invited_notification.delay(board_id, invited_user_email, invited_by_id)
    except Exception as e:
        print(f"[CELERY NOT AVAILABLE] Running sync: {e}")
        send_member_invited_notification(board_id, invited_user_email, invited_by_id)

