/**
 * CONFLICT DETECTION MODULE
 * Predictive conflict analysis and alerting
 */

use crate::AircraftState;

/// Conflict severity levels
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ConflictSeverity {
    None,
    Advisory,
    Warning,
    Critical,
}

/// Conflict information structure
#[derive(Debug, Clone, Copy)]
pub struct ConflictInfo {
    pub severity: ConflictSeverity,
    pub time_to_conflict: f64,
    pub minimum_distance: f64,
}

impl ConflictInfo {
    pub fn new(severity: ConflictSeverity, time_to_conflict: f64, minimum_distance: f64) -> Self {
        ConflictInfo {
            severity,
            time_to_conflict,
            minimum_distance,
        }
    }
}

/// Detect potential conflict between two aircraft
pub fn detect_conflict(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
    horizontal_separation: f64,
    vertical_separation: f64,
    look_ahead_time: f64,
) -> ConflictInfo {
    let mut min_distance = calculate_distance(aircraft1, aircraft2);
    let mut conflict_time = -1.0;
    
    let time_step = 1.0; // 1 second steps
    let mut current_time = 0.0;
    
    let mut temp1 = *aircraft1;
    let mut temp2 = *aircraft2;
    
    while current_time <= look_ahead_time {
        temp1 = predict_position(&temp1, time_step);
        temp2 = predict_position(&temp2, time_step);
        
        let horizontal_dist = calculate_horizontal_distance(&temp1, &temp2);
        let vertical_dist = (temp1.altitude - temp2.altitude).abs();
        
        if horizontal_dist < min_distance {
            min_distance = horizontal_dist;
        }
        
        // Check for conflict
        if horizontal_dist < horizontal_separation && vertical_dist < vertical_separation {
            if conflict_time < 0.0 {
                conflict_time = current_time;
            }
        }
        
        current_time += time_step;
    }
    
    let severity = calculate_severity(conflict_time, min_distance, horizontal_separation);
    
    ConflictInfo::new(severity, conflict_time, min_distance)
}

/// Calculate conflict severity based on time and distance
fn calculate_severity(time_to_conflict: f64, min_distance: f64, separation_min: f64) -> ConflictSeverity {
    if time_to_conflict < 0.0 {
        return ConflictSeverity::None;
    }
    
    if time_to_conflict < 30.0 || min_distance < separation_min * 0.5 {
        ConflictSeverity::Critical
    } else if time_to_conflict < 60.0 || min_distance < separation_min * 0.75 {
        ConflictSeverity::Warning
    } else if time_to_conflict < 120.0 || min_distance < separation_min {
        ConflictSeverity::Advisory
    } else {
        ConflictSeverity::None
    }
}

/// Calculate 2D distance between aircraft
fn calculate_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    calculate_horizontal_distance(aircraft1, aircraft2)
}

/// Calculate horizontal distance
fn calculate_horizontal_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    let dx = aircraft1.x - aircraft2.x;
    let dy = aircraft1.y - aircraft2.y;
    (dx * dx + dy * dy).sqrt()
}

/// Predict future position
fn predict_position(aircraft: &AircraftState, time_seconds: f64) -> AircraftState {
    let speed_nm_per_sec = aircraft.speed / 3600.0;
    let heading_rad = aircraft.heading.to_radians();
    
    let dx = heading_rad.sin() * speed_nm_per_sec * time_seconds;
    let dy = heading_rad.cos() * speed_nm_per_sec * time_seconds;
    
    AircraftState {
        x: aircraft.x + dx,
        y: aircraft.y + dy,
        altitude: aircraft.altitude,
        heading: aircraft.heading,
        speed: aircraft.speed,
    }
}

/// Check if resolution is effective
pub fn is_resolution_effective(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
    new_heading: f64,
    horizontal_separation: f64,
    vertical_separation: f64,
) -> bool {
    let mut modified_aircraft1 = *aircraft1;
    modified_aircraft1.heading = new_heading;
    
    let conflict = detect_conflict(
        &modified_aircraft1,
        aircraft2,
        horizontal_separation,
        vertical_separation,
        300.0, // Look ahead 5 minutes
    );
    
    matches!(conflict.severity, ConflictSeverity::None)
}

/// Calculate recommended heading change to avoid conflict
pub fn calculate_avoidance_heading(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
) -> f64 {
    let dx = aircraft2.x - aircraft1.x;
    let dy = aircraft2.y - aircraft1.y;
    
    let bearing_to_aircraft2 = dy.atan2(dx).to_degrees();
    
    // Turn 90 degrees right from bearing to other aircraft
    let avoidance_heading = (bearing_to_aircraft2 + 90.0) % 360.0;
    
    avoidance_heading
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_conflict() {
        let aircraft1 = AircraftState::new(0.0, 0.0, 10000.0, 0.0, 250.0);
        let aircraft2 = AircraftState::new(10.0, 10.0, 10000.0, 180.0, 250.0);
        
        let conflict = detect_conflict(&aircraft1, &aircraft2, 3.0, 1000.0, 300.0);
        assert_eq!(conflict.severity, ConflictSeverity::None);
    }

    #[test]
    fn test_conflict_detection() {
        let aircraft1 = AircraftState::new(0.0, 0.0, 10000.0, 0.0, 250.0);
        let aircraft2 = AircraftState::new(0.0, 5.0, 10000.0, 180.0, 250.0);
        
        let conflict = detect_conflict(&aircraft1, &aircraft2, 3.0, 1000.0, 300.0);
        assert_ne!(conflict.severity, ConflictSeverity::None);
    }
}