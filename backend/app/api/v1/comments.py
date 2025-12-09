from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as PyList
from app.db.session import get_db
from app.db.models import User, Comment, Card, Role, RoleType
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.jwt import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/card/{card_id}", response_model=PyList[CommentResponse])
def get_comments(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    comments = db.query(Comment).filter(Comment.card_id == card_id).order_by(Comment.created_at).all()
    return comments


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Card).filter(Card.id == comment_data.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    comment = Comment(
        card_id=comment_data.card_id,
        user_id=current_user.id,
        content=comment_data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    
    db.delete(comment)
    db.commit()

