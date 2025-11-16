"""
AIR TRAFFIC CONTROLLER SIMULATOR - Backend Entry Point
Starts the FastAPI server with WebSocket support
"""

import uvicorn
from src.server import app

if __name__ == "__main__":
    print("=" * 60)
    print("AIR TRAFFIC CONTROLLER SIMULATOR - Backend Server")
    print("=" * 60)
    print("Starting server on http://localhost:8000")
    print("WebSocket endpoint: ws://localhost:8000/ws")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )