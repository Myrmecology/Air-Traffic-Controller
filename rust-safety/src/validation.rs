/**
 * VALIDATION MODULE
 * Input validation and safety checks
 */

use crate::AircraftState;

/// Validate aircraft state parameters
pub fn validate_state(aircraft: &AircraftState) -> bool {
    validate_position(aircraft.x, aircraft.y)
        && validate_altitude(aircraft.altitude)
        && validate_heading(aircraft.heading)
        && validate_speed(aircraft.speed)
}

/// Validate position coordinates
pub fn validate_position(x: f64, y: f64) -> bool {
    // Check if position is within reasonable bounds (e.g., within 100nm of center)
    let distance = (x * x + y * y).sqrt();
    distance <= 100.0 && x.is_finite() && y.is_finite()
}

/// Validate altitude
pub fn validate_altitude(altitude: f64) -> bool {
    altitude >= 0.0 && altitude <= 60000.0 && altitude.is_finite()
}

/// Validate heading
pub fn validate_heading(heading: f64) -> bool {
    heading >= 0.0 && heading < 360.0 && heading.is_finite()
}

/// Validate speed
pub fn validate_speed(speed: f64) -> bool {
    speed >= 100.0 && speed <= 600.0 && speed.is_finite()
}

/// Validate command input
pub fn validate_command(command_type: &str, value: f64) -> bool {
    match command_type {
        "heading" => validate_heading(value),
        "altitude" => validate_altitude(value),
        "speed" => validate_speed(value),
        _ => false,
    }
}

/// Check if altitude is safe for current position
pub fn is_altitude_safe(altitude: f64, x: f64, y: f64) -> bool {
    let distance_from_airport = (x * x + y * y).sqrt();
    
    // Require higher altitude when far from airport
    if distance_from_airport > 20.0 {
        altitude >= 5000.0
    } else if distance_from_airport > 10.0 {
        altitude >= 3000.0
    } else {
        altitude >= 0.0
    }
}

/// Validate heading change magnitude
pub fn is_heading_change_safe(current_heading: f64, target_heading: f64) -> bool {
    let diff = (target_heading - current_heading).abs();
    let normalized_diff = if diff > 180.0 { 360.0 - diff } else { diff };
    
    // Allow heading changes up to 180 degrees
    normalized_diff <= 180.0
}

/// Validate speed change magnitude
pub fn is_speed_change_safe(current_speed: f64, target_speed: f64) -> bool {
    let diff = (target_speed - current_speed).abs();
    
    // Allow speed changes up to 150 knots
    diff <= 150.0
}

/// Validate altitude change magnitude
pub fn is_altitude_change_safe(current_altitude: f64, target_altitude: f64) -> bool {
    let diff = (target_altitude - current_altitude).abs();
    
    // Allow altitude changes up to 20,000 feet
    diff <= 20000.0
}

/// Check if aircraft is in valid airspace
pub fn is_in_valid_airspace(aircraft: &AircraftState) -> bool {
    // Check if within radar coverage (50nm radius)
    let distance = (aircraft.x * aircraft.x + aircraft.y * aircraft.y).sqrt();
    distance <= 50.0
}

/// Sanitize input value
pub fn sanitize_value(value: f64, min: f64, max: f64) -> f64 {
    if !value.is_finite() {
        return min;
    }
    value.max(min).min(max)
}

/// Validate separation standards
pub fn validate_separation_standards(horizontal_min: f64, vertical_min: f64) -> bool {
    horizontal_min >= 0.0
        && horizontal_min <= 10.0
        && vertical_min >= 0.0
        && vertical_min <= 5000.0
        && horizontal_min.is_finite()
        && vertical_min.is_finite()
}

/// Check if aircraft configuration is safe
pub fn is_configuration_safe(aircraft: &AircraftState) -> bool {
    // Low speed at low altitude check
    if aircraft.altitude < 5000.0 && aircraft.speed < 140.0 {
        return false;
    }
    
    // High speed at low altitude check
    if aircraft.altitude < 10000.0 && aircraft.speed > 300.0 {
        return false;
    }
    
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_altitude() {
        assert!(validate_altitude(10000.0));
        assert!(!validate_altitude(-1000.0));
        assert!(!validate_altitude(70000.0));
    }

    #[test]
    fn test_validate_heading() {
        assert!(validate_heading(180.0));
        assert!(validate_heading(0.0));
        assert!(validate_heading(359.9));
        assert!(!validate_heading(360.0));
        assert!(!validate_heading(-10.0));
    }

    #[test]
    fn test_validate_speed() {
        assert!(validate_speed(250.0));
        assert!(!validate_speed(50.0));
        assert!(!validate_speed(700.0));
    }

    #[test]
    fn test_validate_state() {
        let valid = AircraftState::new(10.0, 10.0, 10000.0, 180.0, 250.0);
        assert!(validate_state(&valid));
        
        let invalid = AircraftState::new(10.0, 10.0, -1000.0, 180.0, 250.0);
        assert!(!validate_state(&invalid));
    }

    #[test]
    fn test_sanitize_value() {
        assert_eq!(sanitize_value(150.0, 100.0, 200.0), 150.0);
        assert_eq!(sanitize_value(50.0, 100.0, 200.0), 100.0);
        assert_eq!(sanitize_value(250.0, 100.0, 200.0), 200.0);
        assert_eq!(sanitize_value(f64::NAN, 100.0, 200.0), 100.0);
    }
}