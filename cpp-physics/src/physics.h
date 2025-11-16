/**
 * PHYSICS MODULE HEADER
 * High-performance physics calculations for aircraft simulation
 */

#ifndef PHYSICS_H
#define PHYSICS_H

#include <cmath>

namespace ATCPhysics {

/**
 * Aircraft state structure
 */
struct AircraftState {
    double x;              // Position X (nautical miles)
    double y;              // Position Y (nautical miles)
    double altitude;       // Altitude (feet)
    double heading;        // Heading (degrees)
    double speed;          // Speed (knots)
    double targetHeading;  // Target heading (degrees)
    double targetSpeed;    // Target speed (knots)
    double targetAltitude; // Target altitude (feet)
};

/**
 * Physics constants
 */
const double PI = 3.14159265358979323846;
const double DEG_TO_RAD = PI / 180.0;
const double RAD_TO_DEG = 180.0 / PI;

/**
 * Convert degrees to radians
 */
inline double degToRad(double degrees) {
    return degrees * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 */
inline double radToDeg(double radians) {
    return radians * RAD_TO_DEG;
}

/**
 * Normalize heading to 0-359 range
 */
double normalizeHeading(double heading);

/**
 * Calculate shortest heading difference
 */
double headingDifference(double current, double target);

/**
 * Update aircraft position based on physics
 */
void updateAircraftPosition(AircraftState& aircraft, double deltaTime);

/**
 * Calculate distance between two points
 */
double calculateDistance(double x1, double y1, double x2, double y2);

/**
 * Calculate bearing from point 1 to point 2
 */
double calculateBearing(double x1, double y1, double x2, double y2);

/**
 * Apply wind effect to aircraft
 */
void applyWindEffect(AircraftState& aircraft, double windDirection, double windSpeed, double deltaTime);

/**
 * Calculate turn radius based on speed
 */
double calculateTurnRadius(double speed);

/**
 * Calculate climb/descent rate limits
 */
double calculateClimbRate(double currentAltitude, double targetAltitude, double aircraftType);

} // namespace ATCPhysics

#endif // PHYSICS_H