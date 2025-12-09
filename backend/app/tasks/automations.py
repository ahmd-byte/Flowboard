from app.tasks.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Card, Automation, User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def check_due_dates():
    """Check for cards with approaching or past due dates"""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        tomorrow = now + timedelta(days=1)
        
        # Find cards with due dates within 24 hours
        upcoming_cards = db.query(Card).filter(
            Card.due_date.isnot(None),
            Card.due_date <= tomorrow,
            Card.due_date >= now
        ).all()
        
        for card in upcoming_cards:
            send_due_date_reminder.delay(card.id)
        
        logger.info(f"Checked due dates, found {len(upcoming_cards)} upcoming")
        return {"upcoming_cards": len(upcoming_cards)}
    finally:
        db.close()


@celery_app.task
def send_due_date_reminder(card_id: int):
    """Send reminder for a card's due date"""
    db = SessionLocal()
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return {"status": "card_not_found"}
        
        # TODO: Implement actual notification logic (email, push, etc.)
        logger.info(f"Reminder: Card '{card.title}' is due soon")
        return {"status": "reminder_sent", "card_id": card_id}
    finally:
        db.close()


@celery_app.task
def run_automation(automation_id: int, trigger_data: dict):
    """Execute an automation rule"""
    db = SessionLocal()
    try:
        automation = db.query(Automation).filter(Automation.id == automation_id).first()
        if not automation:
            return {"status": "automation_not_found"}
        
        action_type = automation.action_type
        config = automation.config or {}
        
        if action_type == "move_card":
            return execute_move_card(db, trigger_data, config)
        elif action_type == "send_notification":
            return execute_send_notification(db, trigger_data, config)
        elif action_type == "assign_label":
            return execute_assign_label(db, trigger_data, config)
        else:
            return {"status": "unknown_action", "action_type": action_type}
    finally:
        db.close()


def execute_move_card(db, trigger_data: dict, config: dict):
    """Move a card to a different list"""
    card_id = trigger_data.get("card_id")
    target_list_id = config.get("target_list_id")
    
    if not card_id or not target_list_id:
        return {"status": "missing_params"}
    
    card = db.query(Card).filter(Card.id == card_id).first()
    if card:
        card.list_id = target_list_id
        db.commit()
        return {"status": "card_moved", "card_id": card_id, "new_list_id": target_list_id}
    
    return {"status": "card_not_found"}


def execute_send_notification(db, trigger_data: dict, config: dict):
    """Send a notification"""
    # TODO: Implement notification logic
    logger.info(f"Notification triggered: {trigger_data}")
    return {"status": "notification_sent"}


def execute_assign_label(db, trigger_data: dict, config: dict):
    """Assign a label to a card"""
    # TODO: Implement when labels are added
    return {"status": "label_assigned"}

