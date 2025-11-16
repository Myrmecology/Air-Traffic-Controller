/**
 * COLLISION DETECTION MODULE IMPLEMENTATION
 * High-performance collision and separation checking
 */

#include "collision.h"
#include <cmath>
#include <algorithm>
#include <limits>

namespace ATCPhysics {

bool checkCollision(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation
) {
    // Calculate horizontal distance
    double dx = aircraft1.x - aircraft2.x;
    double dy = aircraft1.y - aircraft2.y;
    double horizontalDist = sqrt(dx * dx + dy * dy);
    
    // Calculate vertical separation
    double verticalDist = fabs(aircraft1.altitude - aircraft2.altitude);
    
    // Check if separation is violated
    return (horizontalDist < horizontalSeparation && verticalDist < verticalSeparation);
}

CollisionResult predictCollision(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation,
    double lookAheadTime
) {
    CollisionResult result;
    result.willCollide = false;
    result.timeToCollision = -1.0;
    result.minimumDistance = std::numeric_limits<double>::max();
    result.closestX = 0.0;
    result.closestY = 0.0;
    
    AircraftState temp1 = aircraft1;
    AircraftState temp2 = aircraft2;
    
    double timeStep = 0.5; // 0.5 second steps for accuracy
    double currentTime = 0.0;
    
    while (currentTime <= lookAheadTime) {
        // Calculate horizontal distance
        double dx = temp1.x - temp2.x;
        double dy = temp1.y - temp2.y;
        double horizontalDist = sqrt(dx * dx + dy * dy);
        
        // Calculate vertical separation
        double verticalDist = fabs(temp1.altitude - temp2.altitude);
        
        // Track minimum distance
        if (horizontalDist < result.minimumDistance) {
            result.minimumDistance = horizontalDist;
            result.closestX = (temp1.x + temp2.x) / 2.0;
            result.closestY = (temp1.y + temp2.y) / 2.0;
        }
        
        // Check if separation is violated
        if (horizontalDist < horizontalSeparation && verticalDist < verticalSeparation) {
            if (!result.willCollide) {
                result.willCollide = true;
                result.timeToCollision = currentTime;
            }
        }
        
        updateAircraftPosition(temp1, timeStep);
        updateAircraftPosition(temp2, timeStep);
        
        currentTime += timeStep;
    }
    
    return result;
}

void calculateSeparation(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double& horizontalDistance,
    double& verticalDistance
) {
    // Calculate horizontal distance
    double dx = aircraft1.x - aircraft2.x;
    double dy = aircraft1.y - aircraft2.y;
    horizontalDistance = sqrt(dx * dx + dy * dy);
    
    // Calculate vertical separation
    verticalDistance = fabs(aircraft1.altitude - aircraft2.altitude);
}

std::vector<std::pair<int, int>> checkMultipleAircraftConflicts(
    const std::vector<AircraftState>& aircraft,
    double horizontalSeparation,
    double verticalSeparation
) {
    std::vector<std::pair<int, int>> conflicts;
    
    for (size_t i = 0; i < aircraft.size(); ++i) {
        for (size_t j = i + 1; j < aircraft.size(); ++j) {
            if (checkCollision(aircraft[i], aircraft[j], horizontalSeparation, verticalSeparation)) {
                conflicts.push_back(std::make_pair(static_cast<int>(i), static_cast<int>(j)));
            }
        }
    }
    
    return conflicts;
}

double calculateConflictProbability(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double lookAheadTime
) {
    // Simple probability calculation based on closure rate and distance
    double horizontalDist, verticalDist;
    calculateSeparation(aircraft1, aircraft2, horizontalDist, verticalDist);
    
    // Calculate closure rate
    double hdg1Rad = degToRad(aircraft1.heading);
    double hdg2Rad = degToRad(aircraft2.heading);
    
    double v1x = sin(hdg1Rad) * aircraft1.speed / 3600.0;
    double v1y = cos(hdg1Rad) * aircraft1.speed / 3600.0;
    double v2x = sin(hdg2Rad) * aircraft2.speed / 3600.0;
    double v2y = cos(hdg2Rad) * aircraft2.speed / 3600.0;
    
    double relVelX = v2x - v1x;
    double relVelY = v2y - v1y;
    double closureRate = sqrt(relVelX * relVelX + relVelY * relVelY);
    
    // Calculate probability (0.0 to 1.0)
    double distanceFactor = std::max(0.0, 1.0 - (horizontalDist / 10.0));
    double rateFactor = std::min(1.0, closureRate * 10.0);
    
    return distanceFactor * rateFactor * 0.5;
}

int findNearestAircraft(
    const AircraftState& aircraft,
    const std::vector<AircraftState>& otherAircraft
) {
    int nearestIndex = -1;
    double minDistance = std::numeric_limits<double>::max();
    
    for (size_t i = 0; i < otherAircraft.size(); ++i) {
        double distance = calculateDistance(
            aircraft.x, aircraft.y,
            otherAircraft[i].x, otherAircraft[i].y
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = static_cast<int>(i);
        }
    }
    
    return nearestIndex;
}

bool isInProtectedAirspace(
    double x,
    double y,
    double altitude,
    double centerX,
    double centerY,
    double radius,
    double minAltitude,
    double maxAltitude
) {
    // Check horizontal distance from center
    double distance = calculateDistance(x, y, centerX, centerY);
    
    if (distance > radius) {
        return false;
    }
    
    // Check altitude bounds
    if (altitude < minAltitude || altitude > maxAltitude) {
        return false;
    }
    
    return true;
}

} // namespace ATCPhysics