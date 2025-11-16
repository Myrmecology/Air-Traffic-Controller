/**
 * WASM BINDINGS MODULE
 * C interface for exposing C++ functions to JavaScript
 */

#include "physics.h"
#include "trajectory.h"
#include "collision.h"

// C linkage for WebAssembly exports
extern "C" {

/**
 * Update aircraft position (exported to JavaScript)
 */
void updateAircraftPosition(
    double* x,
    double* y,
    double* altitude,
    double* heading,
    double* speed,
    double targetHeading,
    double targetSpeed,
    double targetAltitude,
    double deltaTime
) {
    ATCPhysics::AircraftState aircraft;
    aircraft.x = *x;
    aircraft.y = *y;
    aircraft.altitude = *altitude;
    aircraft.heading = *heading;
    aircraft.speed = *speed;
    aircraft.targetHeading = targetHeading;
    aircraft.targetSpeed = targetSpeed;
    aircraft.targetAltitude = targetAltitude;
    
    ATCPhysics::updateAircraftPosition(aircraft, deltaTime);
    
    *x = aircraft.x;
    *y = aircraft.y;
    *altitude = aircraft.altitude;
    *heading = aircraft.heading;
    *speed = aircraft.speed;
}

/**
 * Calculate trajectory (exported to JavaScript)
 */
void calculateTrajectory(
    double x,
    double y,
    double altitude,
    double heading,
    double speed,
    double timeAhead,
    double* futureX,
    double* futureY,
    double* futureAltitude
) {
    ATCPhysics::AircraftState aircraft;
    aircraft.x = x;
    aircraft.y = y;
    aircraft.altitude = altitude;
    aircraft.heading = heading;
    aircraft.speed = speed;
    aircraft.targetHeading = heading;
    aircraft.targetSpeed = speed;
    aircraft.targetAltitude = altitude;
    
    ATCPhysics::TrajectoryPoint point = ATCPhysics::predictPosition(aircraft, timeAhead);
    
    *futureX = point.x;
    *futureY = point.y;
    *futureAltitude = point.altitude;
}

/**
 * Check collision (exported to JavaScript)
 */
int checkCollision(
    double x1,
    double y1,
    double alt1,
    double hdg1,
    double spd1,
    double x2,
    double y2,
    double alt2,
    double hdg2,
    double spd2,
    double horizontalSep,
    double verticalSep
) {
    ATCPhysics::AircraftState aircraft1;
    aircraft1.x = x1;
    aircraft1.y = y1;
    aircraft1.altitude = alt1;
    aircraft1.heading = hdg1;
    aircraft1.speed = spd1;
    
    ATCPhysics::AircraftState aircraft2;
    aircraft2.x = x2;
    aircraft2.y = y2;
    aircraft2.altitude = alt2;
    aircraft2.heading = hdg2;
    aircraft2.speed = spd2;
    
    bool collision = ATCPhysics::checkCollision(aircraft1, aircraft2, horizontalSep, verticalSep);
    
    return collision ? 1 : 0;
}

} // extern "C"