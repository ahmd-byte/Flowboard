from fastapi import WebSocket
from typing import Dict, Set, Optional
from dataclasses import dataclass
import json
import asyncio


@dataclass
class UserConnection:
    websocket: WebSocket
    user_id: int
    user_name: str
    cursor_x: Optional[float] = None
    cursor_y: Optional[float] = None


class WebSocketManager:
    def __init__(self):
        # board_id -> set of UserConnection
        self.active_connections: Dict[int, Dict[int, UserConnection]] = {}
    
    async def connect(self, websocket: WebSocket, board_id: int, user_id: int, user_name: str):
        await websocket.accept()
        if board_id not in self.active_connections:
            self.active_connections[board_id] = {}
        
        connection = UserConnection(
            websocket=websocket,
            user_id=user_id,
            user_name=user_name
        )
        self.active_connections[board_id][user_id] = connection
        
        # Notify others that user joined
        await self.broadcast_to_board(board_id, {
            "type": "user_joined",
            "payload": {
                "user_id": user_id,
                "user_name": user_name
            }
        }, exclude_user_id=user_id)
        
        # Send current users to the new connection
        users = self.get_board_users(board_id)
        await websocket.send_text(json.dumps({
            "type": "users_list",
            "payload": {"users": users}
        }))
    
    def disconnect(self, websocket: WebSocket, board_id: int, user_id: int):
        if board_id in self.active_connections:
            if user_id in self.active_connections[board_id]:
                del self.active_connections[board_id][user_id]
            if not self.active_connections[board_id]:
                del self.active_connections[board_id]
    
    async def notify_user_left(self, board_id: int, user_id: int, user_name: str):
        await self.broadcast_to_board(board_id, {
            "type": "user_left",
            "payload": {
                "user_id": user_id,
                "user_name": user_name
            }
        })
    
    def get_board_users(self, board_id: int) -> list:
        if board_id not in self.active_connections:
            return []
        return [
            {
                "user_id": conn.user_id,
                "user_name": conn.user_name,
                "cursor_x": conn.cursor_x,
                "cursor_y": conn.cursor_y
            }
            for conn in self.active_connections[board_id].values()
        ]
    
    async def update_cursor(self, board_id: int, user_id: int, x: float, y: float):
        if board_id in self.active_connections and user_id in self.active_connections[board_id]:
            conn = self.active_connections[board_id][user_id]
            conn.cursor_x = x
            conn.cursor_y = y
            
            await self.broadcast_to_board(board_id, {
                "type": "cursor_move",
                "payload": {
                    "user_id": user_id,
                    "user_name": conn.user_name,
                    "x": x,
                    "y": y
                }
            }, exclude_user_id=user_id)
    
    async def broadcast_to_board(self, board_id: int, message: dict, exclude_user_id: int = None):
        """Broadcast message to all connections on a board"""
        if board_id not in self.active_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        for user_id, conn in self.active_connections[board_id].items():
            if user_id != exclude_user_id:
                try:
                    await conn.websocket.send_text(message_json)
                except Exception:
                    disconnected.append(user_id)
        
        # Clean up disconnected clients
        for user_id in disconnected:
            if user_id in self.active_connections.get(board_id, {}):
                del self.active_connections[board_id][user_id]
    
    async def send_card_moved(self, board_id: int, card_id: int, source_list_id: int, 
                               dest_list_id: int, position: int, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_moved",
            "payload": {
                "card_id": str(card_id),
                "source_list_id": str(source_list_id),
                "dest_list_id": str(dest_list_id),
                "position": position
            }
        }, exclude_user_id=user_id)
    
    async def send_card_created(self, board_id: int, card: dict, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_created",
            "payload": card
        }, exclude_user_id=user_id)
    
    async def send_card_updated(self, board_id: int, card: dict, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_updated",
            "payload": card
        }, exclude_user_id=user_id)
    
    async def send_card_deleted(self, board_id: int, card_id: int, list_id: int, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_deleted",
            "payload": {"card_id": str(card_id), "list_id": str(list_id)}
        }, exclude_user_id=user_id)
    
    async def send_list_created(self, board_id: int, list_data: dict, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_created",
            "payload": list_data
        }, exclude_user_id=user_id)
    
    async def send_list_updated(self, board_id: int, list_data: dict, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_updated",
            "payload": list_data
        }, exclude_user_id=user_id)
    
    async def send_list_deleted(self, board_id: int, list_id: int, user_id: int = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_deleted",
            "payload": {"list_id": str(list_id)}
        }, exclude_user_id=user_id)


# Singleton instance
ws_manager = WebSocketManager()
