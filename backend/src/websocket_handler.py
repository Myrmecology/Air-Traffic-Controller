"""
WEBSOCKET HANDLER MODULE
Handles WebSocket message routing and responses
"""

import json
import logging
from typing import Any, Dict
from fastapi import WebSocket

from .config import Config

logger = logging.getLogger(__name__)


class WebSocketHandler:
    """Handles WebSocket communication"""
    
    def __init__(self, flight_simulator):
        self.flight_simulator = flight_simulator
        self.weather = Config.DEFAULT_WEATHER.copy()
    
    async def handle_message(self, websocket: WebSocket, message: str):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "start_scenario":
                await self.handle_start_scenario(websocket, data)
            
            elif message_type == "command":
                await self.handle_command(websocket, data)
            
            elif message_type == "pause":
                await self.handle_pause(websocket)
            
            elif message_type == "reset":
                await self.handle_reset(websocket)
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse message: {e}")
            await self.send_error(websocket, "Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await self.send_error(websocket, str(e))
    
    async def handle_start_scenario(self, websocket: WebSocket, data: Dict[str, Any]):
        """Handle start scenario request"""
        scenario_id = data.get("scenarioId", "1")
        
        logger.info(f"Starting scenario: {scenario_id}")
        
        # Get scenario configuration
        scenario = Config.get_scenario(scenario_id)
        
        # Initialize scenario in flight simulator
        self.flight_simulator.start_scenario(scenario)
        
        # Send confirmation
        await websocket.send_text(json.dumps({
            "type": "scenario_started",
            "data": {
                "scenarioId": scenario_id,
                "name": scenario["name"],
                "description": scenario["description"]
            }
        }))
        
        # Send system message
        await websocket.send_text(json.dumps({
            "type": "system_message",
            "message": f"Scenario {scenario_id} started",
            "level": "info"
        }))
    
    async def handle_command(self, websocket: WebSocket, data: Dict[str, Any]):
        """Handle aircraft command"""
        aircraft_id = data.get("aircraftId")
        command = data.get("command")
        value = data.get("value")
        
        logger.info(f"Command received: {command} for aircraft {aircraft_id}, value: {value}")
        
        # Execute command in flight simulator
        success = self.flight_simulator.execute_command(aircraft_id, command, value)
        
        if success:
            await websocket.send_text(json.dumps({
                "type": "command_acknowledged",
                "aircraftId": aircraft_id,
                "command": command,
                "value": value
            }))
        else:
            await self.send_error(websocket, f"Failed to execute command for aircraft {aircraft_id}")
    
    async def handle_pause(self, websocket: WebSocket):
        """Handle pause request"""
        self.flight_simulator.toggle_pause()
        
        await websocket.send_text(json.dumps({
            "type": "system_message",
            "message": "Simulation paused" if self.flight_simulator.is_paused else "Simulation resumed",
            "level": "info"
        }))
    
    async def handle_reset(self, websocket: WebSocket):
        """Handle reset request"""
        self.flight_simulator.reset()
        
        await websocket.send_text(json.dumps({
            "type": "system_message",
            "message": "Simulation reset",
            "level": "info"
        }))
    
    async def send_weather_update(self, websocket: WebSocket):
        """Send weather update to client"""
        await websocket.send_text(json.dumps({
            "type": "weather_update",
            "data": self.weather
        }))
    
    async def send_conflict_alert(self, websocket: WebSocket, aircraft1_id: str, aircraft2_id: str):
        """Send conflict alert to client"""
        aircraft1 = self.flight_simulator.get_aircraft(aircraft1_id)
        aircraft2 = self.flight_simulator.get_aircraft(aircraft2_id)
        
        if aircraft1 and aircraft2:
            await websocket.send_text(json.dumps({
                "type": "conflict_alert",
                "data": {
                    "aircraft1": aircraft1["callsign"],
                    "aircraft2": aircraft2["callsign"]
                }
            }))
    
    async def send_aircraft_landed(self, websocket: WebSocket, aircraft_id: str, points: int):
        """Send aircraft landed notification"""
        aircraft = self.flight_simulator.get_aircraft(aircraft_id)
        
        if aircraft:
            await websocket.send_text(json.dumps({
                "type": "aircraft_landed",
                "data": {
                    "id": aircraft_id,
                    "callsign": aircraft["callsign"],
                    "points": points
                }
            }))
    
    async def send_score_update(self, websocket: WebSocket, points: int, message: str):
        """Send score update to client"""
        await websocket.send_text(json.dumps({
            "type": "score_update",
            "data": {
                "points": points,
                "message": message
            }
        }))
    
    async def send_error(self, websocket: WebSocket, error_message: str):
        """Send error message to client"""
        await websocket.send_text(json.dumps({
            "type": "error",
            "error": error_message
        }))