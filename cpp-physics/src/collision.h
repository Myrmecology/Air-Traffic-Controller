/**
 * COLLISION DETECTION MODULE HEADER
 * High-performance collision and separation checking
 */

#ifndef COLLISION_H
#define COLLISION_H

#include "physics.h"
#include <vector>

namespace ATCPhysics {

/**
 * Collision result structure
 */
struct CollisionResult {
    bool willCollide;
    double timeToCollision;
    double minimumDistance;
    double closestX;
    double closestY;
};

/**
 * Check if two aircraft are in conflict
 */
bool checkCollision(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation
);

/**
 * Predict collision with detailed results
 */
CollisionResult predictCollision(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation,
    double lookAheadTime
);

/**
 * Calculate separation between two aircraft
 */
void calculateSeparation(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double& horizontalDistance,
    double& verticalDistance
);

/**
 * Check multiple aircraft for conflicts
 */
std::vector<std::pair<int, int>> checkMultipleAircraftConflicts(
    const std::vector<AircraftState>& aircraft,
    double horizontalSeparation,
    double verticalSeparation
);

/**
 * Calculate conflict probability
 */
double calculateConflictProbability(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double lookAheadTime
);

/**
 * Find nearest aircraft
 */
int findNearestAircraft(
    const AircraftState& aircraft,
    const std::vector<AircraftState>& otherAircraft
);

/**
 * Check if point is within protected airspace
 */
bool isInProtectedAirspace(
    double x,
    double y,
    double altitude,
    double centerX,
    double centerY,
    double radius,
    double minAltitude,
    double maxAltitude
);

} // namespace ATCPhysics

#endif // COLLISION_H