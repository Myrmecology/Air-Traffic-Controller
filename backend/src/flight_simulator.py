"""
FLIGHT SIMULATOR MODULE
Core simulation logic for aircraft management and updates
"""

import logging
import math
from typing import Dict, List, Optional, Any
from .aircraft_generator import AircraftGenerator
from .scenario_manager import ScenarioManager
from .scoring_system import ScoringSystem
from .config import Config

logger = logging.getLogger(__name__)


class FlightSimulator:
    """Main flight simulation engine"""
    
    def __init__(self):
        self.aircraft: Dict[str, Dict[str, Any]] = {}
        self.aircraft_generator = AircraftGenerator()
        self.scenario_manager = ScenarioManager()
        self.scoring_system = ScoringSystem()
        
        self.is_paused = False
        self.current_scenario = None
        self.simulation_time = 0.0
        
        logger.info("Flight Simulator initialized")
    
    def start_scenario(self, scenario: Dict[str, Any]):
        """Start a new scenario"""
        logger.info(f"Starting scenario: {scenario['name']}")
        
        # Reset simulation
        self.reset()
        
        # Set current scenario
        self.current_scenario = scenario
        
        # Generate initial aircraft
        aircraft_count = scenario.get("aircraft_count", 3)
        
        for i in range(aircraft_count):
            aircraft = self.aircraft_generator.generate_aircraft(i)
            self.aircraft[aircraft["id"]] = aircraft
            logger.info(f"Generated aircraft: {aircraft['callsign']}")
    
    def update(self):
        """Update simulation state"""
        if self.is_paused:
            return
        
        # Update simulation time
        self.simulation_time += Config.UPDATE_RATE
        
        # Update all aircraft
        for aircraft_id, aircraft in list(self.aircraft.items()):
            self.update_aircraft(aircraft)
            
            # Check if aircraft has landed
            if self.check_landing(aircraft):
                self.handle_landing(aircraft_id)
        
        # Check for conflicts
        self.check_conflicts()
    
    def update_aircraft(self, aircraft: Dict[str, Any]):
        """Update individual aircraft position and state"""
        delta_time = Config.UPDATE_RATE
        
        # Update position based on heading and speed
        speed_nm_per_sec = aircraft["speed"] / 3600  # Convert knots to NM/s
        
        heading_rad = math.radians(aircraft["heading"])
        aircraft["x"] += math.sin(heading_rad) * speed_nm_per_sec * delta_time
        aircraft["y"] += math.cos(heading_rad) * speed_nm_per_sec * delta_time
        
        # Smooth altitude changes
        if aircraft["targetAltitude"] != aircraft["altitude"]:
            alt_diff = aircraft["targetAltitude"] - aircraft["altitude"]
            climb_rate = 1500 * delta_time  # 1500 feet per second
            
            if abs(alt_diff) < climb_rate:
                aircraft["altitude"] = aircraft["targetAltitude"]
            else:
                aircraft["altitude"] += math.copysign(climb_rate, alt_diff)
        
        # Smooth heading changes
        if aircraft["targetHeading"] != aircraft["heading"]:
            heading_diff = self.get_heading_difference(
                aircraft["heading"], 
                aircraft["targetHeading"]
            )
            turn_rate = 3 * delta_time  # 3 degrees per second
            
            if abs(heading_diff) < turn_rate:
                aircraft["heading"] = aircraft["targetHeading"]
            else:
                aircraft["heading"] += math.copysign(turn_rate, heading_diff)
                aircraft["heading"] = aircraft["heading"] % 360
        
        # Smooth speed changes
        if aircraft["targetSpeed"] != aircraft["speed"]:
            speed_diff = aircraft["targetSpeed"] - aircraft["speed"]
            accel_rate = 10 * delta_time  # 10 knots per second
            
            if abs(speed_diff) < accel_rate:
                aircraft["speed"] = aircraft["targetSpeed"]
            else:
                aircraft["speed"] += math.copysign(accel_rate, speed_diff)
    
    def get_heading_difference(self, current: float, target: float) -> float:
        """Calculate shortest heading difference"""
        diff = target - current
        if diff > 180:
            diff -= 360
        if diff < -180:
            diff += 360
        return diff
    
    def check_landing(self, aircraft: Dict[str, Any]) -> bool:
        """Check if aircraft has landed"""
        # Simple landing detection (near origin, low altitude)
        distance = math.sqrt(aircraft["x"]**2 + aircraft["y"]**2)
        
        if distance < 2 and aircraft["altitude"] < 500:
            return True
        return False
    
    def handle_landing(self, aircraft_id: str):
        """Handle aircraft landing"""
        aircraft = self.aircraft.get(aircraft_id)
        if not aircraft:
            return
        
        logger.info(f"Aircraft {aircraft['callsign']} landed")
        
        # Award points
        points = self.scoring_system.calculate_landing_points(aircraft)
        
        # Remove aircraft
        del self.aircraft[aircraft_id]
    
    def check_conflicts(self):
        """Check for separation violations between aircraft"""
        aircraft_list = list(self.aircraft.values())
        
        for i in range(len(aircraft_list)):
            for j in range(i + 1, len(aircraft_list)):
                a1 = aircraft_list[i]
                a2 = aircraft_list[j]
                
                # Calculate horizontal distance
                dx = a1["x"] - a2["x"]
                dy = a1["y"] - a2["y"]
                horizontal_dist = math.sqrt(dx * dx + dy * dy)
                
                # Calculate vertical separation
                vertical_dist = abs(a1["altitude"] - a2["altitude"])
                
                # Check if separation is violated
                if (horizontal_dist < Config.HORIZONTAL_SEPARATION and 
                    vertical_dist < Config.VERTICAL_SEPARATION):
                    
                    logger.warning(f"Separation violation: {a1['callsign']} and {a2['callsign']}")
                    a1["inConflict"] = True
                    a2["inConflict"] = True
                else:
                    a1["inConflict"] = False
                    a2["inConflict"] = False
    
    def execute_command(self, aircraft_id: str, command: str, value: Any) -> bool:
        """Execute command for aircraft"""
        aircraft = self.aircraft.get(aircraft_id)
        if not aircraft:
            logger.error(f"Aircraft not found: {aircraft_id}")
            return False
        
        try:
            if command == "heading":
                aircraft["targetHeading"] = float(value)
                logger.info(f"{aircraft['callsign']}: Turn heading {value}")
            
            elif command == "altitude":
                aircraft["targetAltitude"] = float(value)
                logger.info(f"{aircraft['callsign']}: {'Climb' if value > aircraft['altitude'] else 'Descend'} to {value}")
            
            elif command == "speed":
                aircraft["targetSpeed"] = float(value)
                logger.info(f"{aircraft['callsign']}: Speed {value} knots")
            
            elif command == "approach":
                logger.info(f"{aircraft['callsign']}: Cleared for approach")
                # Set aircraft on approach path
                aircraft["targetHeading"] = 0
                aircraft["targetAltitude"] = 3000
                aircraft["targetSpeed"] = 180
            
            elif command == "cleared":
                logger.info(f"{aircraft['callsign']}: Cleared to land")
                # Set aircraft for landing
                aircraft["targetHeading"] = 0
                aircraft["targetAltitude"] = 0
                aircraft["targetSpeed"] = 140
            
            else:
                logger.warning(f"Unknown command: {command}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return False
    
    def get_aircraft_data(self) -> List[Dict[str, Any]]:
        """Get all aircraft data for transmission"""
        return list(self.aircraft.values())
    
    def get_aircraft(self, aircraft_id: str) -> Optional[Dict[str, Any]]:
        """Get specific aircraft data"""
        return self.aircraft.get(aircraft_id)
    
    def toggle_pause(self):
        """Toggle simulation pause state"""
        self.is_paused = not self.is_paused
        logger.info(f"Simulation {'paused' if self.is_paused else 'resumed'}")
    
    def reset(self):
        """Reset simulation to initial state"""
        logger.info("Resetting simulation")
        self.aircraft.clear()
        self.simulation_time = 0.0
        self.is_paused = False
        self.current_scenario = None