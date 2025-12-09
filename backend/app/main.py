from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, boards, lists, cards, comments, roles, automations
from app.services.websocket_manager import ws_manager

app = FastAPI(
    title="Flowboard API",
    description="A Trello-like Kanban board API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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


@app.get("/")
def read_root():
    return {"message": "Welcome to Flowboard API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/boards/{board_id}")
async def websocket_endpoint(websocket: WebSocket, board_id: int):
    await ws_manager.connect(websocket, board_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            # For now, just keep connection alive
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, board_id)
