# ATC Simulator Architecture

## Overview

The ATC Simulator is a multi-language, browser-based application that demonstrates professional software architecture through the integration of four programming languages: JavaScript, Python, C++, and Rust. Each language serves a specific purpose optimized for its strengths.

## System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Frontend (JavaScript)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │  main.js │  │ radar.js │  │  ui.js / audio.js│  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  │       │              │                  │           │   │
│  │       └──────────────┴──────────────────┘           │   │
│  │                      │                              │   │
│  │              ┌───────▼────────┐                     │   │
│  │              │  WebSocket     │                     │   │
│  │              │  Client        │                     │   │
│  │              └───────┬────────┘                     │   │
│  └──────────────────────┼──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────┼──────────────────────────────┐   │
│  │           WASM Modules (In Browser)                 │   │
│  │  ┌─────────────────┐      ┌────────────────────┐   │   │
│  │  │  C++ Physics    │      │  Rust Safety       │   │   │
│  │  │  (physics.wasm) │      │  (safety.wasm)     │   │   │
│  │  │                 │      │                    │   │   │
│  │  │ • Trajectory    │      │ • Separation       │   │   │
│  │  │ • Collision     │      │ • Validation       │   │   │
│  │  │ • Wind effects  │      │ • Conflict detect  │   │   │
│  │  └─────────────────┘      └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket (ws://localhost:8000/ws)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend Server                             │
│                   (Python + FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              server.py (FastAPI App)                 │   │
│  │  ┌──────────────────┐  ┌──────────────────────────┐ │   │
│  │  │ REST Endpoints   │  │  WebSocket Handler       │ │   │
│  │  │ • /health        │  │  • Message routing       │ │   │
│  │  │ • /scenarios     │  │  • Client management     │ │   │
│  │  │ • /config        │  │  • Broadcasting          │ │   │
│  │  └──────────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │           Core Simulation Engine                     │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  flight_simulator.py                        │    │   │
│  │  │  • Aircraft state management                │    │   │
│  │  │  • Physics updates (100ms intervals)        │    │   │
│  │  │  • Collision detection                      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ aircraft_    │  │ scenario_    │  │ scoring_ │  │   │
│  │  │ generator.py │  │ manager.py   │  │ system.py│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend Layer (JavaScript)

**Purpose:** User interface, visualization, and real-time interaction

**Technologies:**
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API for radar rendering
- WebSocket API for real-time communication
- Web Audio API for sound effects

**Key Modules:**

#### `main.js`
- **Role:** Application entry point and orchestration
- **Responsibilities:**
  - Initialize all subsystems
  - Load WASM modules
  - Manage application state
  - Coordinate updates between modules
  - Handle aircraft selection and commands

#### `radar.js`
- **Role:** Radar display rendering
- **Responsibilities:**
  - Canvas-based radar visualization
  - Draw range rings, compass headings, runways
  - Render aircraft symbols and data blocks
  - Animate radar sweep
  - Handle mouse interactions (click, hover)

#### `ui.js`
- **Role:** User interface management
- **Responsibilities:**
  - Flight strip management
  - Command modal handling
  - Alert notifications
  - Statistics display
  - Weather panel updates

#### `websocket.js`
- **Role:** Real-time server communication
- **Responsibilities:**
  - WebSocket connection management
  - Message serialization/deserialization
  - Automatic reconnection
  - Message queue for offline handling

#### `audio.js`
- **Role:** Sound effect management
- **Responsibilities:**
  - Procedural sound generation
  - Alert tones
  - Radar sweep sounds
  - Volume control

#### `utils.js`
- **Role:** Common utilities
- **Responsibilities:**
  - Mathematical functions (distance, bearing, etc.)
  - Format conversions
  - Validation helpers

### 2. Backend Layer (Python)

**Purpose:** Simulation logic, state management, and API server

**Technologies:**
- Python 3.11+
- FastAPI for REST and WebSocket
- Uvicorn as ASGI server
- Asyncio for concurrent operations

**Key Modules:**

#### `server.py`
- **Role:** FastAPI application and WebSocket endpoint
- **Responsibilities:**
  - HTTP endpoint routing
  - WebSocket connection lifecycle
  - CORS configuration
  - Simulation loop coordination
  - Client broadcast management

#### `flight_simulator.py`
- **Role:** Core simulation engine
- **Responsibilities:**
  - Aircraft state management (position, heading, speed, altitude)
  - Physics updates (100ms tick rate)
  - Collision detection
  - Landing detection
  - Command execution

#### `websocket_handler.py`
- **Role:** Message routing and protocol handling
- **Responsibilities:**
  - Parse incoming WebSocket messages
  - Route commands to appropriate handlers
  - Format outgoing messages
  - Error handling and validation

#### `aircraft_generator.py`
- **Role:** Aircraft creation and initialization
- **Responsibilities:**
  - Generate random callsigns
  - Position aircraft around radar perimeter
  - Assign realistic speeds and altitudes
  - Ensure diversity in aircraft types

#### `scenario_manager.py`
- **Role:** Scenario configuration and progression
- **Responsibilities:**
  - Load scenario definitions
  - Track scenario objectives
  - Manage difficulty scaling
  - Calculate scenario scores

#### `scoring_system.py`
- **Role:** Points calculation and performance tracking
- **Responsibilities:**
  - Award landing points
  - Apply violation penalties
  - Calculate efficiency bonuses
  - Generate performance grades

#### `config.py`
- **Role:** Centralized configuration
- **Responsibilities:**
  - Define constants (separation standards, limits)
  - Store scenario definitions
  - Configure server parameters

### 3. C++ Physics Module (WASM)

**Purpose:** High-performance physics calculations

**Technologies:**
- C++17
- Emscripten for WebAssembly compilation
- CMake build system

**Why C++:**
- Raw computational performance for trajectory calculations
- Efficient floating-point operations
- Proven libraries for mathematical operations

**Key Components:**

#### `physics.cpp/h`
- **Responsibilities:**
  - Aircraft position updates
  - Heading normalization
  - Speed and altitude interpolation
  - Wind effect calculations
  - Turn radius calculations

#### `trajectory.cpp/h`
- **Responsibilities:**
  - Future position prediction
  - Trajectory path calculation
  - Intercept point calculation
  - Time to closest approach
  - Minimum separation prediction

#### `collision.cpp/h`
- **Responsibilities:**
  - Collision detection algorithms
  - Multi-aircraft conflict checking
  - Protected airspace verification
  - Conflict probability calculation

#### `bindings.cpp`
- **Responsibilities:**
  - C-compatible interface for WASM
  - Data marshaling between JS and C++
  - Function exports for JavaScript

### 4. Rust Safety Module (WASM)

**Purpose:** Memory-safe separation monitoring and validation

**Technologies:**
- Rust 1.70+
- wasm-bindgen for JavaScript interop
- wasm-pack build tool

**Why Rust:**
- Memory safety guarantees (no undefined behavior)
- Zero-cost abstractions
- Ideal for safety-critical calculations
- Excellent WebAssembly support

**Key Components:**

#### `lib.rs`
- **Responsibilities:**
  - WASM module initialization
  - Public API exports
  - Type definitions (AircraftState, SeparationResult)

#### `separation.rs`
- **Responsibilities:**
  - Separation standard enforcement
  - Distance calculations
  - Convergence detection
  - Minimum separation prediction

#### `conflict.rs`
- **Responsibilities:**
  - Predictive conflict analysis
  - Severity classification
  - Conflict resolution suggestions
  - Avoidance heading calculation

#### `state.rs`
- **Responsibilities:**
  - State change tracking
  - Historical data management
  - Rate of change calculations
  - Anomaly detection

#### `validation.rs`
- **Responsibilities:**
  - Input parameter validation
  - Command safety verification
  - Airspace boundary checking
  - Configuration sanitation

## Data Flow

### 1. Initialization Flow
```
User opens browser
  ├─> Load HTML/CSS/JS
  ├─> Initialize UI components
  ├─> Load WASM modules (C++ & Rust)
  ├─> Connect WebSocket to Python backend
  └─> Display loading screen until ready
```

### 2. Scenario Start Flow
```
User selects scenario and clicks Start
  ├─> Frontend sends "start_scenario" via WebSocket
  ├─> Backend receives message
  ├─> Scenario Manager loads configuration
  ├─> Aircraft Generator creates aircraft
  ├─> Backend sends "scenario_started" confirmation
  ├─> Backend sends initial aircraft positions
  └─> Frontend renders aircraft on radar
```

### 3. Simulation Update Loop (100ms)
```
Backend simulation tick (every 100ms)
  ├─> For each aircraft:
  │     ├─> Update position (Python or C++ WASM)
  │     ├─> Update altitude (smooth interpolation)
  │     ├─> Update heading (smooth turn)
  │     └─> Update speed (smooth acceleration)
  │
  ├─> Check separation violations (Python or Rust WASM)
  │     └─> If violation: Mark aircraft, send alert
  │
  ├─> Check landing conditions
  │     └─> If landed: Award points, remove aircraft
  │
  ├─> Serialize aircraft data to JSON
  ├─> Broadcast to all connected clients via WebSocket
  │
  └─> Frontend receives update
        ├─> Update aircraft positions in state
        ├─> Render radar display
        └─> Update UI elements (flight strips, stats)
```

### 4. Command Flow
```
User issues command (e.g., "Turn heading 270")
  ├─> Frontend validates input
  ├─> Send command via WebSocket
  ├─> Backend receives command
  ├─> WebSocket Handler routes to Flight Simulator
  ├─> Flight Simulator updates target values
  ├─> Send acknowledgment to client
  ├─> Log command in history
  └─> Aircraft smoothly transitions to new target
```

### 5. Conflict Detection Flow
```
Every simulation tick:
  ├─> For each pair of aircraft:
  │     ├─> Calculate horizontal distance
  │     ├─> Calculate vertical separation
  │     ├─> Check against minimums (3nm, 1000ft)
  │     └─> If violated:
  │           ├─> Call Rust WASM validation
  │           ├─> Mark aircraft in conflict
  │           ├─> Send conflict alert
  │           ├─> Play audio alert
  │           └─> Apply score penalty
```

## Technology Choices Rationale

### JavaScript (Frontend)
- **Native browser support** - No compilation needed
- **Canvas API** - Excellent for custom radar visualization
- **WebSocket API** - Built-in real-time communication
- **Ecosystem** - Rich library support

### Python (Backend)
- **FastAPI** - Modern, fast async framework
- **Readability** - Easy to understand simulation logic
- **Rapid development** - Quick iteration on features
- **WebSocket support** - Native async WebSocket handling

### C++ (Physics WASM)
- **Performance** - 2-3x faster than JavaScript for math
- **Precision** - Critical for trajectory calculations
- **Proven** - Battle-tested in aerospace applications
- **Emscripten** - Mature WASM compilation toolchain

### Rust (Safety WASM)
- **Memory safety** - No null pointers, no buffer overflows
- **Correctness** - Compile-time guarantees
- **Performance** - As fast as C++
- **Modern tooling** - Excellent WASM support via wasm-pack

## Performance Considerations

### Update Rate
- **Simulation:** 100ms (10 Hz)
- **Rendering:** ~60 FPS (managed by browser)
- **WebSocket:** Messages sent at simulation rate

### Optimization Strategies

1. **WASM for Heavy Computation**
   - Physics calculations run in C++
   - Validation runs in Rust
   - Avoids JavaScript overhead

2. **Efficient Rendering**
   - Canvas cleared once per frame
   - Only redraw changed elements
   - Use requestAnimationFrame

3. **State Management**
   - Maintain single source of truth (backend)
   - Frontend caches state for rendering
   - Reconcile on each update

4. **Network Efficiency**
   - Binary WebSocket data (future optimization)
   - Delta updates (send only changes)
   - Message batching

## Scalability

### Current Limitations
- Single simulation instance per server
- ~10-15 aircraft maximum for smooth performance
- Single-threaded Python backend

### Future Improvements
- **Multi-instance support:** Run multiple simulations
- **Redis pub/sub:** Scale WebSocket connections
- **Worker processes:** Parallel simulation processing
- **Database:** Persist scenarios and scores

## Security Considerations

### Development Mode
- CORS enabled for all origins
- No authentication required
- WebSocket open to all

### Production Recommendations
- **HTTPS/WSS:** Encrypted connections
- **Authentication:** JWT tokens or session-based
- **Rate limiting:** Prevent abuse
- **Input validation:** All commands validated server-side
- **CORS restrictions:** Whitelist specific domains

## Testing Strategy

### Unit Tests
- **Python:** Test individual modules (pytest)
- **Rust:** Built-in test framework (`cargo test`)
- **C++:** Google Test framework
- **JavaScript:** Jest or Mocha

### Integration Tests
- **WebSocket communication:** Test message flow
- **WASM integration:** Verify JS ↔ WASM calls
- **End-to-end:** Selenium for browser automation

### Performance Tests
- **Load testing:** Multiple concurrent users
- **Stress testing:** Maximum aircraft count
- **Benchmark WASM:** Compare C++ vs Rust vs JS

## Deployment Architecture

### Development
```
Localhost:3000 (Frontend) ←→ Localhost:8000 (Backend)
```

### Production
```
                 ┌─────────────┐
                 │   CDN       │
                 │  (Frontend) │
                 └──────┬──────┘
                        │
                 ┌──────▼──────┐
Internet ───────►│   Nginx     │
                 │  (Reverse   │
                 │   Proxy)    │
                 └──────┬──────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
   ┌─────▼─────┐              ┌────────▼────────┐
   │  FastAPI  │              │   WebSocket     │
   │  (REST)   │              │   Server        │
   └───────────┘              └─────────────────┘
```

## File Structure Summary
```
atc-simulator/
├── frontend/           # JavaScript UI
│   ├── src/
│   │   ├── js/        # Application logic
│   │   ├── css/       # Styles
│   │   └── assets/    # Audio, fonts
│   └── index.html     # Entry point
│
├── backend/           # Python server
│   ├── src/           # Application modules
│   └── run.py         # Server entry point
│
├── cpp-physics/       # C++ WASM module
│   ├── src/           # Physics code
│   └── CMakeLists.txt # Build config
│
├── rust-safety/       # Rust WASM module
│   ├── src/           # Safety code
│   └── Cargo.toml     # Package config
│
├── wasm/              # Compiled WASM outputs
├── docs/              # Documentation
└── README.md          # Project overview
```

## Design Patterns Used

1. **MVC Pattern** (Frontend)
   - Model: Aircraft state
   - View: Radar display
   - Controller: User interactions

2. **Publisher-Subscriber** (WebSocket)
   - Backend publishes updates
   - Frontend subscribes to messages

3. **Singleton** (Managers)
   - AudioManager, UIManager (single instances)

4. **Factory** (Aircraft Generator)
   - Creates aircraft with varied properties

5. **Strategy** (WASM Modules)
   - Interchangeable JS/C++/Rust implementations

## Conclusion

This architecture demonstrates a modern, multi-language approach to building a complex real-time simulation. Each language is used where it provides the most value, resulting in a system that is both performant and maintainable.