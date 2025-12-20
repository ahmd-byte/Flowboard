import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.jwt import decode_token
from app.db.session import get_db
from app.api.v1 import auth, users, boards, lists, cards, comments, roles, automations, stats
from app.services.websocket_manager import ws_manager
from app.services.permissions import check_board_access

app = FastAPI(
    title="Flowboard API",
    description="A Trello-like Kanban board API",
    version="1.0.0"
)

# CORS - Allow all localhost ports in development
origins = [
    *settings.cors_origins_list,
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(boards.router, prefix="/api/v1")
app.include_router(lists.router, prefix="/api/v1")
app.include_router(cards.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(automations.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to Flowboard API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/boards/{board_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    board_id: int, 
    token: str = Query(None),  # JWT token for authentication (preferred)
    user_id: int = Query(None),  # Optional - for backward compatibility
    user_name: str = Query(None)  # Optional - for backward compatibility
):
    """
    WebSocket endpoint for real-time board collaboration.
    
    Requires a valid JWT token in the query parameter (preferred method).
    Falls back to user_id/user_name for backward compatibility (less secure).
    Validates user access to the board before allowing connection.
    """
    final_user_id = None
    final_user_name = None
    
    # Validate JWT token if provided (preferred method)
    if token:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
            return
        
        # Extract user_id from token
        token_user_id = payload.get("sub")
        if not token_user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
            return
        
        final_user_id = int(token_user_id)
        
        # Use token user_id if provided user_id doesn't match (security)
        if user_id and user_id != final_user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User ID mismatch")
            return
    elif user_id:
        # Backward compatibility: use provided user_id (less secure, for development)
        final_user_id = user_id
        final_user_name = user_name or f"User {user_id}"
    else:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
        return
    
    # Get user from database for name and validate access
    db = next(get_db())
    try:
        from app.db.models import User
        user = db.query(User).filter(User.id == final_user_id).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
            return
        
        if not final_user_name:
            final_user_name = user.name or user.email
        
        # Check board access
        try:
            check_board_access(db, board_id, final_user_id)
        except HTTPException as e:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=e.detail)
            return
    finally:
        db.close()
    
    # Connect to WebSocket
    await ws_manager.connect(websocket, board_id, final_user_id, final_user_name)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue  # Ignore malformed messages
            
            # Handle cursor movement
            if message.get("type") == "cursor_move":
                payload = message.get("payload", {})
                await ws_manager.update_cursor(
                    board_id, 
                    final_user_id, 
                    payload.get("x", 0), 
                    payload.get("y", 0)
                )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, board_id, final_user_id)
        await ws_manager.notify_user_left(board_id, final_user_id, final_user_name)
