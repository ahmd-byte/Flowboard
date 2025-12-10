from app.tasks.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Card, Automation, User, Board, List as ListModel, Role
from app.services.email_service import email_service, card_created_email, card_moved_email, member_invited_email
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
        
        # Get board members to notify
        list_obj = db.query(ListModel).filter(ListModel.id == card.list_id).first()
        if not list_obj:
            return {"status": "list_not_found"}
        
        board = db.query(Board).filter(Board.id == list_obj.board_id).first()
        if not board:
            return {"status": "board_not_found"}
        
        # Get all board members
        roles = db.query(Role).filter(Role.board_id == board.id).all()
        members = [role.user for role in roles if role.user]
        
        # Send email to each member
        emails_sent = 0
        for member in members:
            if member.email:
                subject = f"⏰ Reminder: '{card.title}' is due soon"
                html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 20px; }}
                        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
                        .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }}
                        .content {{ padding: 30px; }}
                        .card-box {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }}
                        .card-title {{ font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0; }}
                        .meta {{ color: #6b7280; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⏰ Due Date Reminder</h1>
                        </div>
                        <div class="content">
                            <p>Hey {member.name}! 👋</p>
                            <p>This is a reminder that a card is due soon:</p>
                            <div class="card-box">
                                <p class="card-title">{card.title}</p>
                                <p class="meta">Due: {card.due_date.strftime('%B %d, %Y') if card.due_date else 'N/A'}</p>
                                <p class="meta">Board: {board.title}</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                text = f"Reminder: Card '{card.title}' is due on {card.due_date.strftime('%B %d, %Y') if card.due_date else 'N/A'}"
                
                if email_service.send_email([member.email], subject, html, text):
                    emails_sent += 1
        
        logger.info(f"Reminder sent for card '{card.title}' to {emails_sent} members")
        return {"status": "reminder_sent", "card_id": card_id, "emails_sent": emails_sent}
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
    notification_type = config.get("notification_type", "generic")
    card_id = trigger_data.get("card_id")
    
    if not card_id:
        return {"status": "missing_card_id"}
    
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        return {"status": "card_not_found"}
    
    list_obj = db.query(ListModel).filter(ListModel.id == card.list_id).first()
    if not list_obj:
        return {"status": "list_not_found"}
    
    board = db.query(Board).filter(Board.id == list_obj.board_id).first()
    if not board:
        return {"status": "board_not_found"}
    
    # Get board members
    roles = db.query(Role).filter(Role.board_id == board.id).all()
    members = [role.user for role in roles if role.user]
    
    # Get trigger user
    trigger_user_id = trigger_data.get("user_id")
    trigger_user = db.query(User).filter(User.id == trigger_user_id).first() if trigger_user_id else None
    
    emails_sent = 0
    board_url = f"http://localhost:5173/board/{board.id}"  # TODO: Get from config
    
    for member in members:
        if member.email and member.id != trigger_user_id:  # Don't notify the person who triggered
            if notification_type == "card_created":
                subject, html, text = card_created_email(
                    card.title,
                    list_obj.title,
                    board.title,
                    trigger_user.name if trigger_user else "Someone",
                    board_url
                )
            elif notification_type == "card_moved":
                from_list = trigger_data.get("from_list", "Unknown")
                to_list = list_obj.title
                subject, html, text = card_moved_email(
                    card.title,
                    from_list,
                    to_list,
                    board.title,
                    trigger_user.name if trigger_user else "Someone",
                    board_url
                )
            else:
                # Generic notification
                subject = f"📋 Notification from {board.title}"
                html = f"<p>A notification was triggered for card: {card.title}</p>"
                text = f"Notification: {card.title}"
            
            if email_service.send_email([member.email], subject, html, text):
                emails_sent += 1
    
    logger.info(f"Notification sent to {emails_sent} members for card '{card.title}'")
    return {"status": "notification_sent", "emails_sent": emails_sent}


def execute_assign_label(db, trigger_data: dict, config: dict):
    """Assign a label to a card"""
    card_id = trigger_data.get("card_id")
    label = config.get("label")
    
    if not card_id or not label:
        return {"status": "missing_params"}
    
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        return {"status": "card_not_found"}
    
    # Parse existing labels (stored as JSON string)
    import json
    try:
        labels = json.loads(card.labels) if card.labels else []
    except:
        labels = []
    
    # Add label if not already present
    if label not in labels:
        labels.append(label)
        card.labels = json.dumps(labels)
        db.commit()
        logger.info(f"Label '{label}' assigned to card '{card.title}'")
        return {"status": "label_assigned", "card_id": card_id, "label": label}
    
    return {"status": "label_already_exists", "card_id": card_id, "label": label}

