from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, boards, lists, cards, comments, roles, automations, stats
from app.services.websocket_manager import ws_manager

app = FastAPI(
    title="Flowboard API",
    description="A Trello-like Kanban board API",
    version="1.0.0"
)

# CORS - Allow all localhost ports in development
origins = settings.cors_origins_list + [
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
    user_id: int = Query(0), 
    user_name: str = Query("Guest")
):
    await ws_manager.connect(websocket, board_id, user_id, user_name)
    try:
        while True:
            data = await websocket.receive_text()
            import json
            message = json.loads(data)
            
            # Handle cursor movement
            if message.get("type") == "cursor_move":
                payload = message.get("payload", {})
                await ws_manager.update_cursor(
                    board_id, 
                    user_id, 
                    payload.get("x", 0), 
                    payload.get("y", 0)
                )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, board_id, user_id)
        await ws_manager.notify_user_left(board_id, user_id, user_name)
