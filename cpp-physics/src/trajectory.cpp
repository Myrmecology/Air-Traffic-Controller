/**
 * TRAJECTORY MODULE IMPLEMENTATION
 * Trajectory prediction and path calculation
 */

#include "trajectory.h"
#include <cmath>
#include <algorithm>

namespace ATCPhysics {

TrajectoryPoint predictPosition(const AircraftState& aircraft, double timeAhead) {
    TrajectoryPoint point;
    
    // Calculate distance traveled
    double distanceNM = (aircraft.speed / 3600.0) * timeAhead;
    
    // Calculate position based on heading
    double headingRad = degToRad(aircraft.heading);
    point.x = aircraft.x + sin(headingRad) * distanceNM;
    point.y = aircraft.y + cos(headingRad) * distanceNM;
    
    // Predict altitude (simple linear interpolation)
    double altDiff = aircraft.targetAltitude - aircraft.altitude;
    double climbRate = 1500.0; // feet per second
    double altChange = copysign(std::min(fabs(altDiff), climbRate * timeAhead), altDiff);
    point.altitude = aircraft.altitude + altChange;
    
    point.time = timeAhead;
    
    return point;
}

std::vector<TrajectoryPoint> calculateTrajectory(
    const AircraftState& aircraft, 
    double duration, 
    double timeStep
) {
    std::vector<TrajectoryPoint> trajectory;
    
    AircraftState tempState = aircraft;
    double currentTime = 0.0;
    
    while (currentTime <= duration) {
        TrajectoryPoint point;
        point.x = tempState.x;
        point.y = tempState.y;
        point.altitude = tempState.altitude;
        point.time = currentTime;
        
        trajectory.push_back(point);
        
        // Update temp state
        updateAircraftPosition(tempState, timeStep);
        currentTime += timeStep;
    }
    
    return trajectory;
}

bool calculateInterceptPoint(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double& interceptX,
    double& interceptY,
    double& interceptTime
) {
    // Calculate velocity components for both aircraft
    double hdg1Rad = degToRad(aircraft1.heading);
    double hdg2Rad = degToRad(aircraft2.heading);
    
    double v1x = sin(hdg1Rad) * aircraft1.speed / 3600.0;
    double v1y = cos(hdg1Rad) * aircraft1.speed / 3600.0;
    double v2x = sin(hdg2Rad) * aircraft2.speed / 3600.0;
    double v2y = cos(hdg2Rad) * aircraft2.speed / 3600.0;
    
    // Calculate relative position and velocity
    double dx = aircraft2.x - aircraft1.x;
    double dy = aircraft2.y - aircraft1.y;
    double dvx = v2x - v1x;
    double dvy = v2y - v1y;
    
    // Calculate time to intercept
    double a = dvx * dvx + dvy * dvy;
    double b = 2.0 * (dx * dvx + dy * dvy);
    double c = dx * dx + dy * dy;
    
    if (fabs(a) < 1e-10) {
        return false; // Parallel paths
    }
    
    double discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0) {
        return false; // No intercept
    }
    
    double t1 = (-b - sqrt(discriminant)) / (2.0 * a);
    double t2 = (-b + sqrt(discriminant)) / (2.0 * a);
    
    // Choose the positive time
    interceptTime = (t1 > 0) ? t1 : t2;
    
    if (interceptTime < 0) {
        return false; // Intercept in the past
    }
    
    // Calculate intercept position
    interceptX = aircraft1.x + v1x * interceptTime;
    interceptY = aircraft1.y + v1y * interceptTime;
    
    return true;
}

double timeToClosestApproach(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2
) {
    // Calculate velocity components
    double hdg1Rad = degToRad(aircraft1.heading);
    double hdg2Rad = degToRad(aircraft2.heading);
    
    double v1x = sin(hdg1Rad) * aircraft1.speed / 3600.0;
    double v1y = cos(hdg1Rad) * aircraft1.speed / 3600.0;
    double v2x = sin(hdg2Rad) * aircraft2.speed / 3600.0;
    double v2y = cos(hdg2Rad) * aircraft2.speed / 3600.0;
    
    // Relative position and velocity
    double dx = aircraft2.x - aircraft1.x;
    double dy = aircraft2.y - aircraft1.y;
    double dvx = v2x - v1x;
    double dvy = v2y - v1y;
    
    // Calculate time to closest approach
    double relativeSpeed = sqrt(dvx * dvx + dvy * dvy);
    
    if (relativeSpeed < 1e-10) {
        return 0.0; // No relative motion
    }
    
    double tca = -(dx * dvx + dy * dvy) / (dvx * dvx + dvy * dvy);
    
    return std::max(0.0, tca);
}

double minimumSeparationDistance(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double lookAheadTime
) {
    double minDistance = calculateDistance(aircraft1.x, aircraft1.y, aircraft2.x, aircraft2.y);
    
    AircraftState temp1 = aircraft1;
    AircraftState temp2 = aircraft2;
    
    double timeStep = 1.0; // 1 second steps
    double currentTime = 0.0;
    
    while (currentTime <= lookAheadTime) {
        updateAircraftPosition(temp1, timeStep);
        updateAircraftPosition(temp2, timeStep);
        
        double distance = calculateDistance(temp1.x, temp1.y, temp2.x, temp2.y);
        minDistance = std::min(minDistance, distance);
        
        currentTime += timeStep;
    }
    
    return minDistance;
}

bool willViolateSeparation(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation,
    double lookAheadTime
) {
    AircraftState temp1 = aircraft1;
    AircraftState temp2 = aircraft2;
    
    double timeStep = 1.0; // 1 second steps
    double currentTime = 0.0;
    
    while (currentTime <= lookAheadTime) {
        // Calculate horizontal distance
        double horizontalDist = calculateDistance(temp1.x, temp1.y, temp2.x, temp2.y);
        
        // Calculate vertical separation
        double verticalDist = fabs(temp1.altitude - temp2.altitude);
        
        // Check if separation is violated
        if (horizontalDist < horizontalSeparation && verticalDist < verticalSeparation) {
            return true;
        }
        
        updateAircraftPosition(temp1, timeStep);
        updateAircraftPosition(temp2, timeStep);
        
        currentTime += timeStep;
    }
    
    return false;
}

} // namespace ATCPhysics