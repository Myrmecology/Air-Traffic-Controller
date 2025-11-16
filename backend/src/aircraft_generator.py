"""
AIRCRAFT GENERATOR MODULE
Generates random aircraft with realistic parameters
"""

import random
import string
from typing import Dict, Any
from .config import Config


class AircraftGenerator:
    """Generates aircraft for scenarios"""
    
    def __init__(self):
        self.airlines = ['AAL', 'UAL', 'DAL', 'SWA', 'JBU', 'ASA', 'SKW', 'FFT', 'NKS', 'BAW']
        self.used_callsigns = set()
    
    def generate_aircraft(self, index: int) -> Dict[str, Any]:
        """Generate a random aircraft with realistic parameters"""
        
        # Generate unique callsign
        callsign = self.generate_callsign()
        
        # Select random aircraft type
        aircraft_type = random.choice(Config.AIRCRAFT_TYPES)
        
        # Generate starting position (around the perimeter)
        angle = random.uniform(0, 360)
        distance = random.uniform(40, 50)  # Start near edge of radar
        
        x = distance * math.sin(math.radians(angle))
        y = distance * math.cos(math.radians(angle))
        
        # Generate heading (generally toward center with some variation)
        heading_to_center = (angle + 180) % 360
        heading = heading_to_center + random.uniform(-30, 30)
        heading = heading % 360
        
        # Generate altitude (typically cruise or approach altitude)
        altitude_options = [3000, 5000, 7000, 10000, 15000, 20000]
        altitude = random.choice(altitude_options)
        
        # Generate speed based on aircraft type and altitude
        if altitude < 10000:
            speed = random.randint(180, 250)
        else:
            speed = random.randint(250, 350)
        
        aircraft = {
            "id": f"AC{index:03d}",
            "callsign": callsign,
            "type": aircraft_type,
            "x": x,
            "y": y,
            "altitude": altitude,
            "heading": heading,
            "speed": speed,
            "targetAltitude": altitude,
            "targetHeading": heading,
            "targetSpeed": speed,
            "inConflict": False,
            "isSelected": False
        }
        
        return aircraft
    
    def generate_callsign(self) -> str:
        """Generate unique callsign"""
        max_attempts = 100
        
        for _ in range(max_attempts):
            airline = random.choice(self.airlines)
            flight_number = random.randint(100, 9999)
            callsign = f"{airline}{flight_number}"
            
            if callsign not in self.used_callsigns:
                self.used_callsigns.add(callsign)
                return callsign
        
        # Fallback if all attempts fail
        return f"TEST{random.randint(1000, 9999)}"
    
    def reset(self):
        """Reset generator state"""
        self.used_callsigns.clear()


# Import math for the aircraft_generator
import math