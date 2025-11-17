# ATC Simulator API Documentation

## Overview

The ATC Simulator uses a combination of REST API endpoints and WebSocket connections for real-time communication between the frontend and backend.

## Base URLs

- **REST API:** `http://localhost:8000`
- **WebSocket:** `ws://localhost:8000/ws`

## REST API Endpoints

### Health Check

**GET** `/health`

Returns the current health status of the server.

**Response:**
```json
{
  "status": "healthy",
  "active_connections": 2,
  "aircraft_count": 5
}
```

### Get Scenarios

**GET** `/scenarios`

Returns available scenario configurations.

**Response:**
```json
{
  "scenarios": {
    "1": {
      "name": "Level 1 - Basic Training",
      "description": "Simple scenario with 2-3 aircraft",
      "aircraft_count": 3,
      "difficulty": 1
    },
    "2": {
      "name": "Level 2 - Moderate Traffic",
      "description": "Moderate traffic with 4-5 aircraft",
      "aircraft_count": 5,
      "difficulty": 2
    }
    // ... more scenarios
  }
}
```

### Get Configuration

**GET** `/config`

Returns current simulation configuration.

**Response:**
```json
{
  "radar_range": 50,
  "horizontal_separation": 3,
  "vertical_separation": 1000,
  "update_rate": 0.1
}
```

### Root Endpoint

**GET** `/`

Returns API information.

**Response:**
```json
{
  "name": "ATC Simulator API",
  "version": "1.0.0",
  "status": "running"
}
```

## WebSocket Communication

### Connection

**Endpoint:** `ws://localhost:8000/ws`

**Connection Process:**
1. Client opens WebSocket connection
2. Server accepts connection
3. Server sends initial weather data
4. Client and server exchange messages

### Message Format

All WebSocket messages use JSON format:
```json
{
  "type": "message_type",
  "data": { /* message-specific data */ }
}
```

## Client → Server Messages

### Start Scenario

Starts a new simulation scenario.
```json
{
  "type": "start_scenario",
  "scenarioId": "1"
}
```

**Response:**
```json
{
  "type": "scenario_started",
  "data": {
    "scenarioId": "1",
    "name": "Level 1 - Basic Training",
    "description": "Simple scenario with 2-3 aircraft"
  }
}
```

### Issue Command

Send a command to an aircraft.
```json
{
  "type": "command",
  "aircraftId": "AC001",
  "command": "heading",
  "value": 270
}
```

**Command Types:**
- `"heading"` - Change heading (value: 0-359 degrees)
- `"altitude"` - Change altitude (value: feet)
- `"speed"` - Change speed (value: knots)
- `"approach"` - Clear for approach (no value)
- `"cleared"` - Clear to land (no value)

**Response:**
```json
{
  "type": "command_acknowledged",
  "aircraftId": "AC001",
  "command": "heading",
  "value": 270
}
```

### Pause Simulation

Pause or resume the simulation.
```json
{
  "type": "pause"
}
```

### Reset Simulation

Reset the simulation to initial state.
```json
{
  "type": "reset"
}
```

## Server → Client Messages

### Aircraft Update

Sent every 100ms with current aircraft states.
```json
{
  "type": "aircraft_update",
  "data": [
    {
      "id": "AC001",
      "callsign": "AAL1234",
      "type": "B737",
      "x": 25.5,
      "y": 30.2,
      "altitude": 10000,
      "heading": 180,
      "speed": 250,
      "targetAltitude": 10000,
      "targetHeading": 180,
      "targetSpeed": 250,
      "inConflict": false,
      "isSelected": false
    }
    // ... more aircraft
  ]
}
```

### Weather Update

Sent when weather conditions change.
```json
{
  "type": "weather_update",
  "data": {
    "windDirection": 270,
    "windSpeed": 10,
    "visibility": 10,
    "ceiling": "BKN 5000",
    "altimeter": 29.92
  }
}
```

### Conflict Alert

Sent when aircraft separation is violated.
```json
{
  "type": "conflict_alert",
  "data": {
    "aircraft1": "AAL1234",
    "aircraft2": "UAL5678"
  }
}
```

### Aircraft Landed

Sent when an aircraft successfully lands.
```json
{
  "type": "aircraft_landed",
  "data": {
    "id": "AC001",
    "callsign": "AAL1234",
    "points": 120
  }
}
```

### Aircraft Removed

Sent when an aircraft is removed from simulation.
```json
{
  "type": "aircraft_removed",
  "aircraftId": "AC001"
}
```

### Score Update

Sent when score changes.
```json
{
  "type": "score_update",
  "data": {
    "points": 50,
    "message": "Efficient approach bonus"
  }
}
```

### System Message

General system notifications.
```json
{
  "type": "system_message",
  "message": "Scenario 1 started",
  "level": "info"
}
```

**Message Levels:**
- `"info"` - Informational message
- `"warning"` - Warning message
- `"critical"` - Critical alert

### Error Message

Sent when an error occurs.
```json
{
  "type": "error",
  "error": "Aircraft not found: AC999"
}
```

## Data Structures

### Aircraft State
```typescript
{
  id: string,              // Unique identifier
  callsign: string,        // Flight callsign (e.g., "AAL1234")
  type: string,            // Aircraft type (e.g., "B737")
  x: number,               // X position in nautical miles
  y: number,               // Y position in nautical miles
  altitude: number,        // Altitude in feet
  heading: number,         // Heading in degrees (0-359)
  speed: number,           // Speed in knots
  targetAltitude: number,  // Target altitude in feet
  targetHeading: number,   // Target heading in degrees
  targetSpeed: number,     // Target speed in knots
  inConflict: boolean,     // True if in separation violation
  isSelected: boolean      // True if selected by user
}
```

### Weather Data
```typescript
{
  windDirection: number,   // Wind direction in degrees
  windSpeed: number,       // Wind speed in knots
  visibility: number,      // Visibility in statute miles
  ceiling: string,         // Cloud ceiling (e.g., "BKN 5000")
  altimeter: number        // Altimeter setting (e.g., 29.92)
}
```

### Scenario Configuration
```typescript
{
  name: string,           // Scenario name
  description: string,    // Scenario description
  aircraft_count: number, // Number of aircraft
  difficulty: number      // Difficulty level (1-5)
}
```

## WASM Module Interfaces

### C++ Physics Module

**Function:** `updateAircraftPosition`

Updates aircraft position based on physics calculations.

**Parameters:**
- `x` (double*) - X position
- `y` (double*) - Y position
- `altitude` (double*) - Altitude
- `heading` (double*) - Heading
- `speed` (double*) - Speed
- `targetHeading` (double) - Target heading
- `targetSpeed` (double) - Target speed
- `targetAltitude` (double) - Target altitude
- `deltaTime` (double) - Time delta in seconds

**Function:** `calculateTrajectory`

Calculates future position of aircraft.

**Parameters:**
- `x, y, altitude, heading, speed` (double) - Current state
- `timeAhead` (double) - Time to predict ahead (seconds)
- `futureX, futureY, futureAltitude` (double*) - Output positions

**Function:** `checkCollision`

Checks for collision between two aircraft.

**Parameters:**
- Aircraft 1 state: `x1, y1, alt1, hdg1, spd1`
- Aircraft 2 state: `x2, y2, alt2, hdg2, spd2`
- `horizontalSep` (double) - Minimum horizontal separation
- `verticalSep` (double) - Minimum vertical separation

**Returns:** `int` (1 if collision, 0 if safe)

### Rust Safety Module

**Function:** `check_separation`

Checks separation between aircraft.

**Parameters:**
- `aircraft1` (AircraftState) - First aircraft
- `aircraft2` (AircraftState) - Second aircraft
- `min_horizontal` (f64) - Minimum horizontal separation (NM)
- `min_vertical` (f64) - Minimum vertical separation (feet)

**Returns:** `SeparationResult`
```typescript
{
  is_safe: boolean,
  horizontal_distance: number,
  vertical_distance: number
}
```

**Function:** `validate_aircraft_state`

Validates aircraft state parameters.

**Parameters:**
- `aircraft` (AircraftState) - Aircraft to validate

**Returns:** `boolean`

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 404 | Aircraft not found | Specified aircraft ID doesn't exist |
| 400 | Invalid command | Command type or value is invalid |
| 500 | Internal server error | Server-side error occurred |
| 1000 | WebSocket normal closure | Connection closed normally |
| 1006 | WebSocket abnormal closure | Connection lost unexpectedly |

## Rate Limits

- **Aircraft Updates:** 10 Hz (every 100ms)
- **Command Submissions:** No limit (processed sequentially)
- **WebSocket Messages:** No rate limit

## Examples

### Example: Complete Flight Workflow
```javascript
// 1. Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws');

// 2. Start scenario
ws.send(JSON.stringify({
  type: 'start_scenario',
  scenarioId: '1'
}));

// 3. Receive aircraft updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'aircraft_update') {
    // Update radar display
    updateRadar(message.data);
  }
};

// 4. Issue command to aircraft
ws.send(JSON.stringify({
  type: 'command',
  aircraftId: 'AC001',
  command: 'heading',
  value: 270
}));

// 5. Monitor for conflicts
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'conflict_alert') {
    alert(`CONFLICT: ${message.data.aircraft1} and ${message.data.aircraft2}`);
  }
};
```

## Testing API Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Get scenarios
curl http://localhost:8000/scenarios

# Get config
curl http://localhost:8000/config
```

### Using Postman or Insomnia

Import the following collection for testing WebSocket connections.

## Security Considerations

- WebSocket connections are not authenticated in development mode
- CORS is enabled for all origins in development
- For production, implement proper authentication and CORS restrictions
- Validate all input on server side
- Rate limit commands in production

## Changelog

### Version 1.0.0
- Initial API release
- REST endpoints for configuration
- WebSocket for real-time updates
- WASM module interfaces