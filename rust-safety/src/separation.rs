/**
 * SEPARATION MONITORING MODULE
 * Memory-safe separation distance calculations
 */

use crate::{AircraftState, SeparationResult};

/// Check if separation standards are met between two aircraft
pub fn check_separation(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
    min_horizontal: f64,
    min_vertical: f64,
) -> SeparationResult {
    let horizontal_distance = calculate_horizontal_distance(aircraft1, aircraft2);
    let vertical_distance = calculate_vertical_distance(aircraft1, aircraft2);
    
    let is_safe = horizontal_distance >= min_horizontal || vertical_distance >= min_vertical;
    
    SeparationResult::new(is_safe, horizontal_distance, vertical_distance)
}

/// Calculate horizontal distance between two aircraft
fn calculate_horizontal_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    let dx = aircraft1.x - aircraft2.x;
    let dy = aircraft1.y - aircraft2.y;
    (dx * dx + dy * dy).sqrt()
}

/// Calculate vertical distance between two aircraft
fn calculate_vertical_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    (aircraft1.altitude - aircraft2.altitude).abs()
}

/// Check if aircraft are converging
pub fn are_converging(aircraft1: &AircraftState, aircraft2: &AircraftState) -> bool {
    let current_distance = calculate_horizontal_distance(aircraft1, aircraft2);
    
    // Predict position 1 second ahead
    let future1 = predict_position(aircraft1, 1.0);
    let future2 = predict_position(aircraft2, 1.0);
    
    let future_distance = calculate_horizontal_distance(&future1, &future2);
    
    future_distance < current_distance
}

/// Predict aircraft position after given time
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

/// Calculate time to minimum separation
pub fn time_to_minimum_separation(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
) -> Option<f64> {
    let dx = aircraft2.x - aircraft1.x;
    let dy = aircraft2.y - aircraft1.y;
    
    let hdg1_rad = aircraft1.heading.to_radians();
    let hdg2_rad = aircraft2.heading.to_radians();
    
    let v1x = hdg1_rad.sin() * aircraft1.speed / 3600.0;
    let v1y = hdg1_rad.cos() * aircraft1.speed / 3600.0;
    let v2x = hdg2_rad.sin() * aircraft2.speed / 3600.0;
    let v2y = hdg2_rad.cos() * aircraft2.speed / 3600.0;
    
    let dvx = v2x - v1x;
    let dvy = v2y - v1y;
    
    let relative_speed_squared = dvx * dvx + dvy * dvy;
    
    if relative_speed_squared < 1e-10 {
        return None; // No relative motion
    }
    
    let time = -(dx * dvx + dy * dvy) / relative_speed_squared;
    
    if time > 0.0 {
        Some(time)
    } else {
        None
    }
}

/// Calculate minimum separation over time period
pub fn minimum_separation_over_time(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
    duration_seconds: f64,
) -> f64 {
    let time_step = 1.0; // 1 second steps
    let mut min_separation = calculate_horizontal_distance(aircraft1, aircraft2);
    
    let mut temp1 = *aircraft1;
    let mut temp2 = *aircraft2;
    
    let mut current_time = 0.0;
    while current_time <= duration_seconds {
        temp1 = predict_position(&temp1, time_step);
        temp2 = predict_position(&temp2, time_step);
        
        let distance = calculate_horizontal_distance(&temp1, &temp2);
        if distance < min_separation {
            min_separation = distance;
        }
        
        current_time += time_step;
    }
    
    min_separation
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_separation_check() {
        let aircraft1 = AircraftState::new(0.0, 0.0, 10000.0, 0.0, 250.0);
        let aircraft2 = AircraftState::new(5.0, 0.0, 10000.0, 180.0, 250.0);
        
        let result = check_separation(&aircraft1, &aircraft2, 3.0, 1000.0);
        assert!(result.is_safe);
    }

    #[test]
    fn test_violation() {
        let aircraft1 = AircraftState::new(0.0, 0.0, 10000.0, 0.0, 250.0);
        let aircraft2 = AircraftState::new(2.0, 0.0, 10500.0, 180.0, 250.0);
        
        let result = check_separation(&aircraft1, &aircraft2, 3.0, 1000.0);
        assert!(!result.is_safe);
    }
}