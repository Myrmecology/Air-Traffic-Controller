/**
 * UTILITY FUNCTIONS MODULE
 * Common helper functions used throughout the application
 */

/**
 * Convert degrees to radians
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Calculate distance between two points (Pythagorean theorem)
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate bearing from point 1 to point 2 (in degrees)
 */
export function calculateBearing(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
    if (bearing < 0) bearing += 360;
    return bearing;
}

/**
 * Normalize heading to 0-359 range
 */
export function normalizeHeading(heading) {
    heading = heading % 360;
    if (heading < 0) heading += 360;
    return heading;
}

/**
 * Calculate shortest angle difference between two headings
 */
export function headingDifference(heading1, heading2) {
    let diff = heading2 - heading1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Format time as HH:MM:SS
 */
export function formatTime(date) {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format altitude (e.g., 10000 -> "FL100" or "10000")
 */
export function formatAltitude(altitude) {
    if (altitude >= 18000) {
        return `FL${Math.round(altitude / 100)}`;
    } else {
        return altitude.toString();
    }
}

/**
 * Format heading with leading zeros (e.g., 45 -> "045")
 */
export function formatHeading(heading) {
    return Math.round(heading).toString().padStart(3, '0');
}

/**
 * Parse callsign to extract airline and flight number
 */
export function parseCallsign(callsign) {
    const match = callsign.match(/^([A-Z]{3})(\d+)$/);
    if (match) {
        return {
            airline: match[1],
            flightNumber: match[2],
            full: callsign
        };
    }
    return {
        airline: '',
        flightNumber: '',
        full: callsign
    };
}

/**
 * Generate random callsign
 */
export function generateCallsign() {
    const airlines = ['AAL', 'UAL', 'DAL', 'SWA', 'JBU', 'ASA', 'SKW'];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = Math.floor(Math.random() * 9000) + 1000;
    return airline + flightNumber;
}

/**
 * Convert nautical miles to pixels based on scale
 */
export function nmToPixels(nm, scale) {
    return nm * scale;
}

/**
 * Convert pixels to nautical miles based on scale
 */
export function pixelsToNm(pixels, scale) {
    return pixels / scale;
}

/**
 * Check if point is inside circle
 */
export function pointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) <= radius;
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Generate random number between min and max
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get aircraft type characteristics
 */
export function getAircraftCharacteristics(type) {
    const characteristics = {
        'B737': { speed: 250, climbRate: 2000, turnRate: 3 },
        'A320': { speed: 250, climbRate: 2000, turnRate: 3 },
        'B777': { speed: 280, climbRate: 1500, turnRate: 2 },
        'A380': { speed: 290, climbRate: 1200, turnRate: 1.5 },
        'CRJ': { speed: 220, climbRate: 2500, turnRate: 4 },
        'E175': { speed: 230, climbRate: 2300, turnRate: 3.5 },
        'default': { speed: 250, climbRate: 2000, turnRate: 3 }
    };
    
    return characteristics[type] || characteristics['default'];
}

/**
 * Calculate ETA (Estimated Time of Arrival) in minutes
 */
export function calculateETA(distanceNM, speedKnots) {
    if (speedKnots === 0) return Infinity;
    return (distanceNM / speedKnots) * 60; // Convert hours to minutes
}

/**
 * Format ETA as MM:SS
 */
export function formatETA(minutes) {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if two aircraft are in conflict
 */
export function checkConflict(aircraft1, aircraft2, horizontalSep, verticalSep) {
    const horizontalDist = distance(aircraft1.x, aircraft1.y, aircraft2.x, aircraft2.y);
    const verticalDist = Math.abs(aircraft1.altitude - aircraft2.altitude);
    
    return horizontalDist < horizontalSep && verticalDist < verticalSep;
}

/**
 * Predict future position
 */
export function predictPosition(x, y, heading, speed, timeMinutes) {
    const distanceNM = (speed / 60) * timeMinutes;
    const headingRad = degToRad(heading);
    
    return {
        x: x + Math.sin(headingRad) * distanceNM,
        y: y + Math.cos(headingRad) * distanceNM
    };
}

/**
 * Calculate closure rate between two aircraft (NM per minute)
 */
export function calculateClosureRate(a1, a2) {
    const bearing1 = calculateBearing(a1.x, a1.y, a2.x, a2.y);
    const bearing2 = calculateBearing(a2.x, a2.y, a1.x, a1.y);
    
    const v1 = a1.speed * Math.cos(degToRad(headingDifference(a1.heading, bearing1)));
    const v2 = a2.speed * Math.cos(degToRad(headingDifference(a2.heading, bearing2)));
    
    return (v1 + v2) / 60; // Convert knots to NM per minute
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculate wind correction angle
 */
export function calculateWindCorrection(trueHeading, windDirection, windSpeed, airspeed) {
    const headingRad = degToRad(trueHeading);
    const windRad = degToRad(windDirection);
    
    const windAngle = windRad - headingRad;
    const windComponent = windSpeed * Math.sin(windAngle);
    
    const correction = Math.asin(windComponent / airspeed);
    return radToDeg(correction);
}

/**
 * Validate heading input (0-359)
 */
export function isValidHeading(heading) {
    return Number.isInteger(heading) && heading >= 0 && heading <= 359;
}

/**
 * Validate altitude input
 */
export function isValidAltitude(altitude) {
    return Number.isInteger(altitude) && altitude >= 0 && altitude <= 60000;
}

/**
 * Validate speed input
 */
export function isValidSpeed(speed) {
    return Number.isInteger(speed) && speed >= 100 && speed <= 600;
}