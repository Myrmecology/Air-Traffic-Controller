/**
 * TRAJECTORY MODULE HEADER
 * Trajectory prediction and path calculation
 */

#ifndef TRAJECTORY_H
#define TRAJECTORY_H

#include "physics.h"
#include <vector>

namespace ATCPhysics {

/**
 * Trajectory point structure
 */
struct TrajectoryPoint {
    double x;
    double y;
    double altitude;
    double time;
};

/**
 * Predict future aircraft position
 */
TrajectoryPoint predictPosition(const AircraftState& aircraft, double timeAhead);

/**
 * Calculate full trajectory path
 */
std::vector<TrajectoryPoint> calculateTrajectory(
    const AircraftState& aircraft, 
    double duration, 
    double timeStep
);

/**
 * Calculate intercept point between two aircraft paths
 */
bool calculateInterceptPoint(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double& interceptX,
    double& interceptY,
    double& interceptTime
);

/**
 * Calculate time to closest point of approach
 */
double timeToClosestApproach(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2
);

/**
 * Calculate minimum separation distance along trajectory
 */
double minimumSeparationDistance(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double lookAheadTime
);

/**
 * Check if trajectory will violate separation
 */
bool willViolateSeparation(
    const AircraftState& aircraft1,
    const AircraftState& aircraft2,
    double horizontalSeparation,
    double verticalSeparation,
    double lookAheadTime
);

} // namespace ATCPhysics

#endif // TRAJECTORY_H