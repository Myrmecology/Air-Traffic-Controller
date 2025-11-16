/**
 * STATE MANAGEMENT MODULE
 * Aircraft state tracking and validation
 */

use crate::AircraftState;

/// State change tracking
#[derive(Debug, Clone, Copy)]
pub struct StateChange {
    pub heading_change: f64,
    pub speed_change: f64,
    pub altitude_change: f64,
}

impl StateChange {
    pub fn new() -> Self {
        StateChange {
            heading_change: 0.0,
            speed_change: 0.0,
            altitude_change: 0.0,
        }
    }
    
    pub fn calculate(previous: &AircraftState, current: &AircraftState) -> Self {
        StateChange {
            heading_change: normalize_heading_diff(current.heading - previous.heading),
            speed_change: current.speed - previous.speed,
            altitude_change: current.altitude - previous.altitude,
        }
    }
    
    pub fn is_significant(&self) -> bool {
        self.heading_change.abs() > 1.0
            || self.speed_change.abs() > 5.0
            || self.altitude_change.abs() > 100.0
    }
}

/// Normalize heading difference to -180 to 180 range
fn normalize_heading_diff(diff: f64) -> f64 {
    let mut result = diff;
    while result > 180.0 {
        result -= 360.0;
    }
    while result < -180.0 {
        result += 360.0;
    }
    result
}

/// Track aircraft state history
#[derive(Debug, Clone)]
pub struct StateHistory {
    states: Vec<AircraftState>,
    max_history: usize,
}

impl StateHistory {
    pub fn new(max_history: usize) -> Self {
        StateHistory {
            states: Vec::with_capacity(max_history),
            max_history,
        }
    }
    
    pub fn add_state(&mut self, state: AircraftState) {
        self.states.push(state);
        
        // Keep only recent history
        if self.states.len() > self.max_history {
            self.states.remove(0);
        }
    }
    
    pub fn get_latest(&self) -> Option<&AircraftState> {
        self.states.last()
    }
    
    pub fn get_previous(&self) -> Option<&AircraftState> {
        if self.states.len() >= 2 {
            Some(&self.states[self.states.len() - 2])
        } else {
            None
        }
    }
    
    pub fn calculate_average_speed(&self) -> Option<f64> {
        if self.states.is_empty() {
            return None;
        }
        
        let sum: f64 = self.states.iter().map(|s| s.speed).sum();
        Some(sum / self.states.len() as f64)
    }
    
    pub fn is_stable(&self, threshold: f64) -> bool {
        if self.states.len() < 2 {
            return true;
        }
        
        let latest = &self.states[self.states.len() - 1];
        let previous = &self.states[self.states.len() - 2];
        
        let change = StateChange::calculate(previous, latest);
        
        change.heading_change.abs() < threshold
            && change.speed_change.abs() < threshold
            && change.altitude_change.abs() < threshold * 10.0
    }
}

/// Check if aircraft state is within normal operating parameters
pub fn is_state_normal(aircraft: &AircraftState) -> bool {
    // Check altitude bounds
    if aircraft.altitude < 0.0 || aircraft.altitude > 60000.0 {
        return false;
    }
    
    // Check speed bounds
    if aircraft.speed < 100.0 || aircraft.speed > 600.0 {
        return false;
    }
    
    // Check heading bounds
    if aircraft.heading < 0.0 || aircraft.heading >= 360.0 {
        return false;
    }
    
    true
}

/// Calculate rate of change
pub fn calculate_rate_of_change(
    previous: &AircraftState,
    current: &AircraftState,
    time_delta: f64,
) -> (f64, f64, f64) {
    let heading_rate = normalize_heading_diff(current.heading - previous.heading) / time_delta;
    let speed_rate = (current.speed - previous.speed) / time_delta;
    let altitude_rate = (current.altitude - previous.altitude) / time_delta;
    
    (heading_rate, speed_rate, altitude_rate)
}

/// Detect unusual state changes
pub fn detect_unusual_changes(
    previous: &AircraftState,
    current: &AircraftState,
    time_delta: f64,
) -> bool {
    let (heading_rate, speed_rate, altitude_rate) = 
        calculate_rate_of_change(previous, current, time_delta);
    
    // Check for unrealistic rates of change
    let max_turn_rate = 5.0; // degrees per second
    let max_accel_rate = 20.0; // knots per second
    let max_climb_rate = 3000.0; // feet per minute (converted to per second)
    
    heading_rate.abs() > max_turn_rate
        || speed_rate.abs() > max_accel_rate
        || altitude_rate.abs() > (max_climb_rate / 60.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_state_change_calculation() {
        let prev = AircraftState::new(0.0, 0.0, 10000.0, 180.0, 250.0);
        let curr = AircraftState::new(1.0, 1.0, 10500.0, 185.0, 255.0);
        
        let change = StateChange::calculate(&prev, &curr);
        
        assert_eq!(change.heading_change, 5.0);
        assert_eq!(change.speed_change, 5.0);
        assert_eq!(change.altitude_change, 500.0);
    }

    #[test]
    fn test_state_history() {
        let mut history = StateHistory::new(5);
        
        for i in 0..10 {
            let state = AircraftState::new(
                i as f64,
                i as f64,
                10000.0,
                0.0,
                250.0,
            );
            history.add_state(state);
        }
        
        assert_eq!(history.states.len(), 5);
    }

    #[test]
    fn test_normal_state() {
        let normal = AircraftState::new(0.0, 0.0, 10000.0, 180.0, 250.0);
        assert!(is_state_normal(&normal));
        
        let abnormal = AircraftState::new(0.0, 0.0, 70000.0, 180.0, 250.0);
        assert!(!is_state_normal(&abnormal));
    }
}