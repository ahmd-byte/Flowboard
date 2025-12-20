"""
Permission checking service for board access control.

This module provides centralized functions for checking user permissions
on boards, lists, and cards to avoid code duplication across API endpoints.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.models import Board, List, Role, RoleType


def check_board_access(
    db: Session,
    board_id: int,
    user_id: int,
    require_edit: bool = False,
    require_admin: bool = False
) -> Board:
    """
    Check if user has access to a board.
    
    Args:
        db: Database session
        board_id: ID of the board to check
        user_id: ID of the user requesting access
        require_edit: If True, requires EDITOR or ADMIN role (default: False)
        require_admin: If True, requires ADMIN role (default: False)
    
    Returns:
        Board object if access is granted
    
    Raises:
        HTTPException: 404 if board not found, 403 if access denied
    """
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Check if user is workspace owner
    is_owner = board.workspace.owner_id == user_id
    
    # Get user's role on the board
    role = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == user_id
    ).first()
    
    # Check basic access
    if not role and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this board"
        )
    
    # Check edit permission
    if require_edit:
        if role and role.role == RoleType.VIEWER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Edit permission required"
            )
        if not role and not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Edit permission required"
            )
    
    # Check admin permission
    if require_admin:
        if role and role.role != RoleType.ADMIN:
            if not is_owner:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin permission required"
                )
    
    return board


def check_list_access(
    db: Session,
    list_id: int,
    user_id: int,
    require_edit: bool = False
) -> List:
    """
    Check if user has access to a list.
    
    Args:
        db: Database session
        list_id: ID of the list to check
        user_id: ID of the user requesting access
        require_edit: If True, requires EDITOR or ADMIN role (default: False)
    
    Returns:
        List object if access is granted
    
    Raises:
        HTTPException: 404 if list not found, 403 if access denied
    """
    list_item = db.query(List).filter(List.id == list_id).first()
    if not list_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Delegate to board access check
    check_board_access(
        db,
        list_item.board_id,
        user_id,
        require_edit=require_edit
    )
    
    return list_item


def get_user_role(db: Session, board_id: int, user_id: int) -> RoleType | None:
    """
    Get user's role on a board.
    
    Args:
        db: Database session
        board_id: ID of the board
        user_id: ID of the user
    
    Returns:
        RoleType if user has a role, None otherwise
    """
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        return None
    
    # Workspace owner is effectively an admin
    if board.workspace.owner_id == user_id:
        return RoleType.ADMIN
    
    role = db.query(Role).filter(
        Role.board_id == board_id,
        Role.user_id == user_id
    ).first()
    
    return role.role if role else None

