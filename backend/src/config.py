"""
CONFIGURATION MODULE
Application settings and constants
"""

import os
from typing import Dict, Any

class Config:
    """Application configuration"""
    
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Simulation settings
    UPDATE_RATE = 0.1  # seconds (100ms)
    RADAR_RANGE = 50  # nautical miles
    
    # Separation standards
    HORIZONTAL_SEPARATION = 3  # nautical miles
    VERTICAL_SEPARATION = 1000  # feet
    
    # Aircraft settings
    MIN_ALTITUDE = 0
    MAX_ALTITUDE = 50000
    MIN_SPEED = 100  # knots
    MAX_SPEED = 500  # knots
    
    # Scenario settings
    SCENARIOS = {
        "1": {
            "name": "Level 1 - Basic Training",
            "description": "Simple scenario with 2-3 aircraft",
            "aircraft_count": 3,
            "difficulty": 1
        },
        "2": {
            "name": "Level 2 - Moderate Traffic",
            "description": "Moderate traffic with 4-5 aircraft",
            "aircraft_count": 5,
            "difficulty": 2
        },
        "3": {
            "name": "Level 3 - Busy Airspace",
            "description": "Busy airspace with 6-8 aircraft",
            "aircraft_count": 7,
            "difficulty": 3
        },
        "4": {
            "name": "Level 4 - Complex Operations",
            "description": "Complex operations with 8-10 aircraft",
            "aircraft_count": 9,
            "difficulty": 4
        },
        "5": {
            "name": "Level 5 - Emergency Scenarios",
            "description": "High-stress emergency situations",
            "aircraft_count": 10,
            "difficulty": 5
        }
    }
    
    # Weather settings
    DEFAULT_WEATHER = {
        "windDirection": 270,
        "windSpeed": 10,
        "visibility": 10,
        "ceiling": "BKN 5000",
        "altimeter": 29.92
    }
    
    # Scoring
    LANDING_POINTS = 100
    VIOLATION_PENALTY = -50
    EFFICIENCY_BONUS = 10
    
    # Aircraft types and their characteristics
    AIRCRAFT_TYPES = [
        "B737", "A320", "B777", "A380", "CRJ", "E175"
    ]
    
    @classmethod
    def get_scenario(cls, scenario_id: str) -> Dict[str, Any]:
        """Get scenario configuration by ID"""
        return cls.SCENARIOS.get(scenario_id, cls.SCENARIOS["1"])