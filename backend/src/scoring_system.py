"""
SCORING SYSTEM MODULE
Calculates scores and manages scoring logic
"""

import logging
from typing import Dict, Any
from .config import Config

logger = logging.getLogger(__name__)


class ScoringSystem:
    """Manages scoring and points calculation"""
    
    def __init__(self):
        self.total_score = 0
        self.landings = 0
        self.violations = 0
        self.efficiency_bonus = 0
    
    def calculate_landing_points(self, aircraft: Dict[str, Any]) -> int:
        """Calculate points awarded for a successful landing"""
        base_points = Config.LANDING_POINTS
        
        # Bonus for smooth approach (low speed)
        speed_bonus = 0
        if aircraft["speed"] < 150:
            speed_bonus = 20
        elif aircraft["speed"] < 170:
            speed_bonus = 10
        
        # Bonus for proper altitude on approach
        altitude_bonus = 0
        if aircraft["altitude"] < 1000:
            altitude_bonus = 10
        
        total_points = base_points + speed_bonus + altitude_bonus
        
        self.total_score += total_points
        self.landings += 1
        
        logger.info(f"Landing points: {total_points} (Speed bonus: {speed_bonus}, Altitude bonus: {altitude_bonus})")
        
        return total_points
    
    def apply_violation_penalty(self, aircraft1: Dict[str, Any], aircraft2: Dict[str, Any]) -> int:
        """Apply penalty for separation violation"""
        penalty = Config.VIOLATION_PENALTY
        
        self.total_score += penalty  # Penalty is negative
        self.violations += 1
        
        logger.warning(f"Separation violation penalty: {penalty} points")
        
        return penalty
    
    def calculate_efficiency_bonus(self, landing_time: float, optimal_time: float) -> int:
        """Calculate efficiency bonus for quick landings"""
        if landing_time <= optimal_time:
            bonus = Config.EFFICIENCY_BONUS
            self.total_score += bonus
            self.efficiency_bonus += bonus
            
            logger.info(f"Efficiency bonus: {bonus} points")
            return bonus
        
        return 0
    
    def get_score_breakdown(self) -> Dict[str, Any]:
        """Get detailed score breakdown"""
        return {
            "total_score": self.total_score,
            "landings": self.landings,
            "violations": self.violations,
            "efficiency_bonus": self.efficiency_bonus,
            "landing_points": self.landings * Config.LANDING_POINTS,
            "violation_penalties": self.violations * Config.VIOLATION_PENALTY
        }
    
    def get_grade(self) -> str:
        """Calculate letter grade based on performance"""
        if self.violations == 0 and self.landings >= 5:
            return "A+"
        elif self.violations == 0:
            return "A"
        elif self.violations <= 1 and self.landings >= 3:
            return "B"
        elif self.violations <= 2:
            return "C"
        elif self.violations <= 3:
            return "D"
        else:
            return "F"
    
    def get_performance_rating(self) -> str:
        """Get textual performance rating"""
        if self.violations == 0 and self.landings >= 5:
            return "Outstanding Performance"
        elif self.violations == 0:
            return "Excellent Performance"
        elif self.violations <= 1:
            return "Good Performance"
        elif self.violations <= 2:
            return "Satisfactory Performance"
        elif self.violations <= 3:
            return "Needs Improvement"
        else:
            return "Unsatisfactory Performance"
    
    def reset(self):
        """Reset scoring system"""
        self.total_score = 0
        self.landings = 0
        self.violations = 0
        self.efficiency_bonus = 0
        logger.info("Scoring system reset")