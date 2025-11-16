/**
 * RUST SAFETY MODULE
 * Memory-safe separation monitoring and conflict detection
 */

use wasm_bindgen::prelude::*;

mod separation;
mod conflict;
mod state;
mod validation;

pub use separation::*;
pub use conflict::*;
pub use state::*;
pub use validation::*;

/// Aircraft state structure
#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct AircraftState {
    pub x: f64,
    pub y: f64,
    pub altitude: f64,
    pub heading: f64,
    pub speed: f64,
}

#[wasm_bindgen]
impl AircraftState {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64, altitude: f64, heading: f64, speed: f64) -> AircraftState {
        AircraftState {
            x,
            y,
            altitude,
            heading,
            speed,
        }
    }
}

/// Separation result structure
#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct SeparationResult {
    pub is_safe: bool,
    pub horizontal_distance: f64,
    pub vertical_distance: f64,
}

#[wasm_bindgen]
impl SeparationResult {
    pub fn new(is_safe: bool, horizontal_distance: f64, vertical_distance: f64) -> SeparationResult {
        SeparationResult {
            is_safe,
            horizontal_distance,
            vertical_distance,
        }
    }
}

/// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error messages
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Check separation between two aircraft (exported to JavaScript)
#[wasm_bindgen]
pub fn check_separation(
    aircraft1: &AircraftState,
    aircraft2: &AircraftState,
    min_horizontal: f64,
    min_vertical: f64,
) -> SeparationResult {
    separation::check_separation(aircraft1, aircraft2, min_horizontal, min_vertical)
}

/// Validate aircraft state (exported to JavaScript)
#[wasm_bindgen]
pub fn validate_aircraft_state(aircraft: &AircraftState) -> bool {
    validation::validate_state(aircraft)
}

/// Calculate horizontal distance between two aircraft
#[wasm_bindgen]
pub fn calculate_horizontal_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    let dx = aircraft1.x - aircraft2.x;
    let dy = aircraft1.y - aircraft2.y;
    (dx * dx + dy * dy).sqrt()
}

/// Calculate vertical distance between two aircraft
#[wasm_bindgen]
pub fn calculate_vertical_distance(aircraft1: &AircraftState, aircraft2: &AircraftState) -> f64 {
    (aircraft1.altitude - aircraft2.altitude).abs()
}