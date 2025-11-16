"""
FASTAPI SERVER MODULE
Main server application with WebSocket support
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set
import asyncio
import json
import logging

from .websocket_handler import WebSocketHandler
from .flight_simulator import FlightSimulator
from .config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ATC Simulator API",
    description="Air Traffic Controller Simulator Backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
active_connections: Set[WebSocket] = set()
flight_simulator: FlightSimulator = None
ws_handler: WebSocketHandler = None
simulation_task: asyncio.Task = None


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    global flight_simulator, ws_handler
    
    logger.info("Starting ATC Simulator Backend...")
    
    # Initialize flight simulator
    flight_simulator = FlightSimulator()
    
    # Initialize WebSocket handler
    ws_handler = WebSocketHandler(flight_simulator)
    
    logger.info("Backend initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global simulation_task
    
    logger.info("Shutting down ATC Simulator Backend...")
    
    # Cancel simulation task
    if simulation_task and not simulation_task.done():
        simulation_task.cancel()
        try:
            await simulation_task
        except asyncio.CancelledError:
            pass
    
    # Close all WebSocket connections
    for connection in active_connections.copy():
        await connection.close()
    
    logger.info("Backend shutdown complete")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "ATC Simulator API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_connections": len(active_connections),
        "aircraft_count": len(flight_simulator.aircraft) if flight_simulator else 0
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    global simulation_task
    
    await websocket.accept()
    active_connections.add(websocket)
    
    logger.info(f"Client connected. Total connections: {len(active_connections)}")
    
    # Start simulation if not already running
    if simulation_task is None or simulation_task.done():
        simulation_task = asyncio.create_task(simulation_loop())
    
    try:
        # Send initial weather data
        await ws_handler.send_weather_update(websocket)
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            await ws_handler.handle_message(websocket, data)
            
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_connections.discard(websocket)
        logger.info(f"Client removed. Total connections: {len(active_connections)}")


async def simulation_loop():
    """Main simulation update loop"""
    logger.info("Simulation loop started")
    
    try:
        while True:
            if flight_simulator and active_connections:
                # Update simulation
                flight_simulator.update()
                
                # Send updates to all connected clients
                aircraft_data = flight_simulator.get_aircraft_data()
                
                if aircraft_data:
                    message = json.dumps({
                        "type": "aircraft_update",
                        "data": aircraft_data
                    })
                    
                    # Send to all connected clients
                    disconnected = set()
                    for connection in active_connections:
                        try:
                            await connection.send_text(message)
                        except Exception as e:
                            logger.error(f"Failed to send update: {e}")
                            disconnected.add(connection)
                    
                    # Remove disconnected clients
                    active_connections.difference_update(disconnected)
            
            # Wait for next update cycle
            await asyncio.sleep(Config.UPDATE_RATE)
            
    except asyncio.CancelledError:
        logger.info("Simulation loop cancelled")
    except Exception as e:
        logger.error(f"Simulation loop error: {e}")


@app.get("/scenarios")
async def get_scenarios():
    """Get available scenarios"""
    return {
        "scenarios": Config.SCENARIOS
    }


@app.get("/config")
async def get_config():
    """Get current configuration"""
    return {
        "radar_range": Config.RADAR_RANGE,
        "horizontal_separation": Config.HORIZONTAL_SEPARATION,
        "vertical_separation": Config.VERTICAL_SEPARATION,
        "update_rate": Config.UPDATE_RATE
    }