/**
 * PHYSICS MODULE IMPLEMENTATION
 * High-performance physics calculations for aircraft simulation
 */

#include "physics.h"
#include <cmath>
#include <algorithm>

namespace ATCPhysics {

double normalizeHeading(double heading) {
    heading = fmod(heading, 360.0);
    if (heading < 0) {
        heading += 360.0;
    }
    return heading;
}

double headingDifference(double current, double target) {
    double diff = target - current;
    if (diff > 180.0) {
        diff -= 360.0;
    }
    if (diff < -180.0) {
        diff += 360.0;
    }
    return diff;
}

void updateAircraftPosition(AircraftState& aircraft, double deltaTime) {
    // Convert speed from knots to nautical miles per second
    double speedNMPerSec = aircraft.speed / 3600.0;
    
    // Update position based on heading and speed
    double headingRad = degToRad(aircraft.heading);
    aircraft.x += sin(headingRad) * speedNMPerSec * deltaTime;
    aircraft.y += cos(headingRad) * speedNMPerSec * deltaTime;
    
    // Smooth altitude changes
    if (aircraft.targetAltitude != aircraft.altitude) {
        double altDiff = aircraft.targetAltitude - aircraft.altitude;
        double climbRate = 1500.0 * deltaTime; // 1500 feet per second
        
        if (fabs(altDiff) < climbRate) {
            aircraft.altitude = aircraft.targetAltitude;
        } else {
            aircraft.altitude += copysign(climbRate, altDiff);
        }
    }
    
    // Smooth heading changes with realistic turn rate
    if (aircraft.targetHeading != aircraft.heading) {
        double hdgDiff = headingDifference(aircraft.heading, aircraft.targetHeading);
        double turnRate = 3.0 * deltaTime; // 3 degrees per second
        
        if (fabs(hdgDiff) < turnRate) {
            aircraft.heading = aircraft.targetHeading;
        } else {
            aircraft.heading += copysign(turnRate, hdgDiff);
            aircraft.heading = normalizeHeading(aircraft.heading);
        }
    }
    
    // Smooth speed changes
    if (aircraft.targetSpeed != aircraft.speed) {
        double speedDiff = aircraft.targetSpeed - aircraft.speed;
        double accelRate = 10.0 * deltaTime; // 10 knots per second
        
        if (fabs(speedDiff) < accelRate) {
            aircraft.speed = aircraft.targetSpeed;
        } else {
            aircraft.speed += copysign(accelRate, speedDiff);
        }
    }
}

double calculateDistance(double x1, double y1, double x2, double y2) {
    double dx = x2 - x1;
    double dy = y2 - y1;
    return sqrt(dx * dx + dy * dy);
}

double calculateBearing(double x1, double y1, double x2, double y2) {
    double dx = x2 - x1;
    double dy = y2 - y1;
    double bearing = atan2(dx, dy) * RAD_TO_DEG;
    return normalizeHeading(bearing);
}

void applyWindEffect(AircraftState& aircraft, double windDirection, double windSpeed, double deltaTime) {
    // Convert wind to components
    double windRad = degToRad(windDirection);
    double windX = sin(windRad) * windSpeed / 3600.0; // Convert to NM/s
    double windY = cos(windRad) * windSpeed / 3600.0;
    
    // Apply wind drift
    aircraft.x += windX * deltaTime;
    aircraft.y += windY * deltaTime;
}

double calculateTurnRadius(double speed) {
    // Standard rate turn: 3 degrees per second
    // Turn radius formula: R = V / (tan(bank_angle) * g)
    // Simplified for standard rate turn
    return speed / 600.0; // Approximate turn radius in nautical miles
}

double calculateClimbRate(double currentAltitude, double targetAltitude, double aircraftType) {
    // Different aircraft types have different climb rates
    double baseClimbRate = 1500.0; // feet per minute
    
    // Reduce climb rate at higher altitudes
    if (currentAltitude > 20000) {
        baseClimbRate *= 0.7;
    } else if (currentAltitude > 10000) {
        baseClimbRate *= 0.85;
    }
    
    return baseClimbRate;
}

} // namespace ATCPhysics