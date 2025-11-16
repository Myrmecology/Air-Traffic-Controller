"""
SCENARIO MANAGER MODULE
Manages different scenario configurations and difficulty levels
"""

import logging
from typing import Dict, Any, List
from .config import Config

logger = logging.getLogger(__name__)


class ScenarioManager:
    """Manages simulation scenarios"""
    
    def __init__(self):
        self.current_scenario = None
        self.scenario_state = {}
    
    def get_scenario(self, scenario_id: str) -> Dict[str, Any]:
        """Get scenario configuration by ID"""
        scenario = Config.get_scenario(scenario_id)
        
        if not scenario:
            logger.warning(f"Scenario {scenario_id} not found, using default")
            scenario = Config.get_scenario("1")
        
        return scenario
    
    def initialize_scenario(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize scenario state"""
        self.current_scenario = scenario
        
        self.scenario_state = {
            "id": scenario.get("name", "Unknown"),
            "difficulty": scenario.get("difficulty", 1),
            "aircraft_count": scenario.get("aircraft_count", 3),
            "events": [],
            "start_time": 0,
            "elapsed_time": 0
        }
        
        logger.info(f"Initialized scenario: {scenario['name']}")
        
        return self.scenario_state
    
    def update_scenario(self, elapsed_time: float):
        """Update scenario state"""
        if not self.current_scenario:
            return
        
        self.scenario_state["elapsed_time"] = elapsed_time
        
        # Check for scenario events based on difficulty
        self.check_scenario_events(elapsed_time)
    
    def check_scenario_events(self, elapsed_time: float):
        """Check and trigger scenario-specific events"""
        difficulty = self.scenario_state.get("difficulty", 1)
        
        # Example: trigger emergency events based on difficulty
        if difficulty >= 4:
            # High difficulty scenarios might have random emergencies
            pass
        
        if difficulty >= 5:
            # Emergency scenarios have additional challenges
            pass
    
    def get_scenario_objectives(self) -> List[str]:
        """Get current scenario objectives"""
        if not self.current_scenario:
            return []
        
        difficulty = self.current_scenario.get("difficulty", 1)
        
        objectives = [
            "Maintain safe separation between all aircraft",
            "Sequence aircraft for landing efficiently"
        ]
        
        if difficulty >= 2:
            objectives.append("Handle moderate traffic density")
        
        if difficulty >= 3:
            objectives.append("Manage complex approach patterns")
        
        if difficulty >= 4:
            objectives.append("Coordinate multiple runway operations")
        
        if difficulty >= 5:
            objectives.append("Handle emergency situations")
        
        return objectives
    
    def calculate_scenario_score(self, stats: Dict[str, Any]) -> int:
        """Calculate final score for scenario"""
        base_score = stats.get("score", 0)
        difficulty = self.scenario_state.get("difficulty", 1)
        
        # Apply difficulty multiplier
        difficulty_multiplier = 1 + (difficulty - 1) * 0.5
        
        final_score = int(base_score * difficulty_multiplier)
        
        return final_score
    
    def is_scenario_complete(self, aircraft_count: int) -> bool:
        """Check if scenario is complete"""
        if not self.current_scenario:
            return False
        
        # Scenario is complete when all aircraft have landed
        return aircraft_count == 0
    
    def get_scenario_status(self) -> Dict[str, Any]:
        """Get current scenario status"""
        return {
            "active": self.current_scenario is not None,
            "scenario_name": self.current_scenario.get("name") if self.current_scenario else None,
            "difficulty": self.scenario_state.get("difficulty", 0),
            "elapsed_time": self.scenario_state.get("elapsed_time", 0),
            "objectives": self.get_scenario_objectives()
        }
    
    def reset(self):
        """Reset scenario manager"""
        self.current_scenario = None
        self.scenario_state = {}
        logger.info("Scenario manager reset")