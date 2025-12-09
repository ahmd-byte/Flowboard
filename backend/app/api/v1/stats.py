from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from app.db.session import get_db
from app.db.models import User, Board, List, Card, Role, Workspace
from app.core.jwt import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/stats", tags=["Statistics"])


class DashboardStats(BaseModel):
    total_boards: int
    total_cards: int
    completed_cards: int
    total_members: int
    cards_this_week: int
    completion_rate: float


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's boards (owned or member of)
    user_board_ids = db.query(Board.id).join(Workspace).filter(
        (Workspace.owner_id == current_user.id) |
        (Board.id.in_(
            db.query(Role.board_id).filter(Role.user_id == current_user.id)
        ))
    ).all()
    board_ids = [b[0] for b in user_board_ids]
    
    # Total boards
    total_boards = len(board_ids)
    
    # Get all lists from user's boards
    list_ids = db.query(List.id).filter(List.board_id.in_(board_ids)).all()
    list_ids = [l[0] for l in list_ids]
    
    # Total cards
    total_cards = db.query(func.count(Card.id)).filter(
        Card.list_id.in_(list_ids)
    ).scalar() or 0
    
    # Completed cards (cards in lists named "Done", "Completed", "Finished")
    done_list_ids = db.query(List.id).filter(
        List.board_id.in_(board_ids),
        func.lower(List.title).in_(['done', 'completed', 'finished'])
    ).all()
    done_list_ids = [l[0] for l in done_list_ids]
    
    completed_cards = db.query(func.count(Card.id)).filter(
        Card.list_id.in_(done_list_ids)
    ).scalar() or 0
    
    # Total unique members across all boards
    total_members = db.query(func.count(distinct(Role.user_id))).filter(
        Role.board_id.in_(board_ids)
    ).scalar() or 0
    
    # Include workspace owner if they have boards
    if total_boards > 0:
        total_members = max(total_members, 1)  # At least count the user
    
    # Cards created this week (using created_at if available, else estimate)
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    cards_this_week = db.query(func.count(Card.id)).filter(
        Card.list_id.in_(list_ids),
        Card.created_at >= week_ago
    ).scalar() or 0
    
    # Completion rate
    completion_rate = (completed_cards / total_cards * 100) if total_cards > 0 else 0
    
    return DashboardStats(
        total_boards=total_boards,
        total_cards=total_cards,
        completed_cards=completed_cards,
        total_members=total_members,
        cards_this_week=cards_this_week,
        completion_rate=round(completion_rate, 1)
    )

