from fastapi import WebSocket
from typing import Dict, Set
import json


class WebSocketManager:
    def __init__(self):
        # board_id -> set of websocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, board_id: int):
        await websocket.accept()
        if board_id not in self.active_connections:
            self.active_connections[board_id] = set()
        self.active_connections[board_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, board_id: int):
        if board_id in self.active_connections:
            self.active_connections[board_id].discard(websocket)
            if not self.active_connections[board_id]:
                del self.active_connections[board_id]
    
    async def broadcast_to_board(self, board_id: int, message: dict, exclude: WebSocket = None):
        """Broadcast message to all connections on a board"""
        if board_id not in self.active_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = set()
        
        for connection in self.active_connections[board_id]:
            if connection != exclude:
                try:
                    await connection.send_text(message_json)
                except Exception:
                    disconnected.add(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.active_connections[board_id].discard(conn)
    
    async def send_card_moved(self, board_id: int, card_id: int, source_list_id: int, 
                               dest_list_id: int, position: int, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_moved",
            "payload": {
                "card_id": card_id,
                "source_list_id": source_list_id,
                "dest_list_id": dest_list_id,
                "position": position
            }
        }, exclude)
    
    async def send_card_created(self, board_id: int, card: dict, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_created",
            "payload": card
        }, exclude)
    
    async def send_card_updated(self, board_id: int, card: dict, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_updated",
            "payload": card
        }, exclude)
    
    async def send_card_deleted(self, board_id: int, card_id: int, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "card_deleted",
            "payload": {"card_id": card_id}
        }, exclude)
    
    async def send_list_created(self, board_id: int, list_data: dict, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_created",
            "payload": list_data
        }, exclude)
    
    async def send_list_updated(self, board_id: int, list_data: dict, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_updated",
            "payload": list_data
        }, exclude)
    
    async def send_list_deleted(self, board_id: int, list_id: int, exclude: WebSocket = None):
        await self.broadcast_to_board(board_id, {
            "type": "list_deleted",
            "payload": {"list_id": list_id}
        }, exclude)


# Singleton instance
ws_manager = WebSocketManager()

