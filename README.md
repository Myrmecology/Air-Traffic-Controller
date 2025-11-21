# Air Traffic Controller Simulator

## Summary

# JavaScript
# C++
# Python
# Rust

The Air Traffic Controller Simulator is a professional-grade, browser-based application that provides an authentic air traffic control experience. This project demonstrates advanced software engineering principles through the seamless integration of four distinct programming languages: JavaScript, Python, C++, and Rust. Each language serves a specific, optimized purpose within the system architecture, creating a high-performance real-time simulation.

Users assume the role of an approach controller, managing aircraft within a 50 nautical mile radar scope. The simulator features realistic flight dynamics, separation monitoring, conflict detection, and a comprehensive command system that mirrors real-world ATC operations.

---

## Multi-Language Architecture

This project leverages the unique strengths of four programming languages, each handling specific responsibilities where they excel.

### JavaScript (Frontend)

**Role:** User interface, visualization, and real-time rendering

**Responsibilities:**
- Renders the radar display using the HTML5 Canvas API with 60fps animation
- Draws aircraft symbols, data blocks, range rings, compass headings, and runway layouts
- Implements the rotating radar sweep animation effect
- Handles all user interactions including aircraft selection, command input, and button clicks
- Manages the WebSocket client for bidirectional real-time communication with the backend
- Updates the UI components including flight strips, weather panel, statistics, alerts, and command history
- Generates procedural audio feedback using the Web Audio API for alerts and confirmations
- Coordinates WASM module loading and function calls for physics and safety calculations

**Key Files:**
- `main.js` - Application entry point and state orchestration
- `radar.js` - Canvas-based radar rendering engine
- `ui.js` - User interface management and DOM manipulation
- `websocket.js` - Real-time server communication
- `audio.js` - Procedural sound generation
- `utils.js` - Mathematical utilities and helper functions

### Python (Backend)

**Role:** Server infrastructure, simulation logic, and state management

**Responsibilities:**
- Hosts the FastAPI web server with REST endpoints and WebSocket support
- Manages the core flight simulation loop running at 10Hz (100ms intervals)
- Calculates aircraft position updates based on heading, speed, and altitude
- Handles smooth interpolation for heading changes, altitude transitions, and speed adjustments
- Generates aircraft with randomized but realistic parameters (callsigns, positions, altitudes, speeds)
- Manages scenario configurations with progressive difficulty levels
- Implements the scoring system with points for landings and penalties for violations
- Broadcasts simulation state to all connected clients via WebSocket
- Processes incoming commands and validates input parameters
- Detects landing conditions and removes aircraft that have successfully landed

**Key Files:**
- `server.py` - FastAPI application with WebSocket endpoint
- `flight_simulator.py` - Core simulation engine
- `websocket_handler.py` - Message routing and protocol handling
- `aircraft_generator.py` - Randomized aircraft creation
- `scenario_manager.py` - Difficulty and objective management
- `scoring_system.py` - Points calculation and grading
- `config.py` - Centralized configuration constants

### C++ (Physics Engine - WebAssembly)

**Role:** High-performance physics calculations

**Responsibilities:**
- Executes computationally intensive trajectory predictions
- Calculates future aircraft positions for vector line rendering
- Performs collision detection algorithms between aircraft pairs
- Computes wind effect calculations on aircraft movement
- Calculates turn radius based on aircraft speed
- Determines climb and descent rate limits based on altitude
- Provides intercept point calculations for converging aircraft
- Calculates time to closest point of approach between aircraft pairs
- Predicts minimum separation distance over time intervals

**Why C++:**
C++ delivers near-native execution speed when compiled to WebAssembly. For trajectory calculations involving trigonometric functions and iterative predictions, C++ outperforms JavaScript by 2-3x. The language has decades of proven use in aerospace and aviation software, making it the natural choice for flight physics.

**Key Files:**
- `physics.cpp` - Core physics functions (position updates, heading normalization)
- `trajectory.cpp` - Future position prediction and path calculation
- `collision.cpp` - Separation checking and conflict detection
- `bindings.cpp` - C-compatible interface for JavaScript interop

### Rust (Safety Module - WebAssembly)

**Role:** Memory-safe separation monitoring and validation

**Responsibilities:**
- Monitors separation standards between all aircraft pairs
- Validates aircraft state parameters (altitude, heading, speed bounds)
- Detects convergence between aircraft on conflicting paths
- Classifies conflict severity levels (Advisory, Warning, Critical)
- Calculates recommended avoidance headings
- Tracks aircraft state history for anomaly detection
- Validates command inputs before execution
- Ensures aircraft remain within valid airspace boundaries
- Performs rate-of-change analysis to detect unusual maneuvers

**Why Rust:**
Rust guarantees memory safety at compile time, eliminating null pointer dereferences, buffer overflows, and data races. For safety-critical aviation calculations where correctness is paramount, Rust provides mathematical guarantees that the code will not exhibit undefined behavior. The language compiles to WebAssembly with performance comparable to C++ while providing stronger safety guarantees.

**Key Files:**
- `lib.rs` - Module initialization and public API exports
- `separation.rs` - Separation distance calculations and monitoring
- `conflict.rs` - Predictive conflict analysis and severity classification
- `state.rs` - Aircraft state tracking and history management
- `validation.rs` - Input validation and safety checks

---

## Scientific Principles

### Radar Coordinate System

The simulator uses a Cartesian coordinate system centered on the airport. The X-axis extends East-West (positive East), and the Y-axis extends North-South (positive North). Distances are measured in nautical miles (NM), where 1 NM equals 1.852 kilometers. The radar range extends 50 NM in all directions from the center.

### Aircraft Position Updates

Aircraft position is calculated using dead reckoning navigation:
```
Δx = sin(heading) × (speed / 3600) × Δt
Δy = cos(heading) × (speed / 3600) × Δt
```

Where:
- `heading` is the aircraft's magnetic heading in radians
- `speed` is groundspeed in knots (nautical miles per hour)
- `Δt` is the time interval in seconds
- Division by 3600 converts knots to nautical miles per second

### Heading Calculations

Headings follow aviation convention: 0° is North, 90° is East, 180° is South, 270° is West. The simulator calculates the shortest turn direction using:
```
difference = target_heading - current_heading
if difference > 180: difference -= 360
if difference < -180: difference += 360
```

This ensures aircraft always turn the shorter direction to reach the target heading.

### Separation Standards

The simulator enforces standard radar separation minimums:
- **Horizontal separation:** 3 nautical miles
- **Vertical separation:** 1,000 feet

A separation violation occurs when both minimums are simultaneously breached. The separation check uses the Euclidean distance formula:
```
horizontal_distance = √((x₁ - x₂)² + (y₁ - y₂)²)
vertical_distance = |altitude₁ - altitude₂|
```

### Smooth State Transitions

Aircraft do not instantly change heading, speed, or altitude. The simulator applies realistic transition rates:
- **Turn rate:** 3 degrees per second (standard rate turn)
- **Acceleration/deceleration:** 10 knots per second
- **Climb/descent rate:** 1,500 feet per minute

These rates are applied incrementally each simulation tick until the target value is reached.

### Trajectory Prediction

Vector lines showing predicted aircraft positions use linear extrapolation:
```
future_x = current_x + sin(heading) × (speed / 60) × minutes
future_y = current_y + cos(heading) × (speed / 60) × minutes
```

The simulator displays 5-minute look-ahead vectors for traffic awareness.

### Conflict Detection Algorithm

The conflict detection system iterates through all aircraft pairs (O(n²) complexity) and performs:

1. Current separation check (immediate violation detection)
2. Predictive separation check (future violation prediction)
3. Convergence analysis (closure rate calculation)
4. Severity classification based on time to conflict

---

## Prerequisites

Before installation, ensure the following software is installed:

- **Node.js** version 18 or higher
- **Python** version 3.11 or higher
- **Rust** version 1.70 or higher
- **wasm-pack** (installed via Cargo)
- **Emscripten SDK** (for C++ to WebAssembly compilation)
- **CMake** version 3.15 or higher
- **Git** (for cloning Emscripten SDK)

---

## Installation Guide

### Step 1: Install wasm-pack
```bash
cargo install wasm-pack
```

### Step 2: Install Emscripten SDK
```bash
cd ~
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
python emsdk.py install latest
python emsdk.py activate latest
```

### Step 3: Clone or Navigate to the Project
```bash
cd /path/to/Air-Traffic-Controller
```

### Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 5: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 6: Build C++ Physics Module

Activate Emscripten environment:
```bash
source ~/emsdk/emsdk_env.sh
```

Build the module:
```bash
cd cpp-physics
mkdir build
cd build
python ~/emsdk/upstream/emscripten/emcmake.py cmake .. -DCMAKE_BUILD_TYPE=Release
python ~/emsdk/upstream/emscripten/emmake.py make
cd ../..
```

### Step 7: Build Rust Safety Module
```bash
cd rust-safety
wasm-pack build --target web --out-dir ../wasm --release
cd ..
```

### Step 8: Verify WASM Files
```bash
ls wasm/
```

You should see: `physics.js`, `physics.wasm`, `atc_safety.js`, `atc_safety_bg.wasm`

---

## Running the Application

### Terminal 1: Start Backend Server
```bash
cd backend
python run.py
```

Expected output:
```
============================================================
AIR TRAFFIC CONTROLLER SIMULATOR - Backend Server
============================================================
Starting server on http://localhost:8000
WebSocket endpoint: ws://localhost:8000/ws
============================================================
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Start Frontend Server

Open a new terminal:
```bash
cd frontend
python -m http.server 3000
```

Expected output:
```
Serving HTTP on :: port 3000 (http://[::]:3000/) ...
```

### Step 3: Open Browser

Navigate to: **http://localhost:3000**

---

## How to Use the Simulator

### Starting a Scenario

1. Locate the SCENARIO panel in the right sidebar
2. Select a difficulty level from the dropdown (Level 1 through Level 5)
3. Click START SCENARIO
4. Aircraft will appear on the radar display

### Selecting Aircraft

- Click directly on an aircraft symbol (triangle) on the radar
- The selected aircraft turns white
- The aircraft callsign appears in the command panel
- The corresponding flight strip highlights in the left sidebar

### Issuing Commands

With an aircraft selected, use the command buttons:

- **HEADING:** Enter a value from 0 to 359 degrees
- **ALTITUDE:** Enter altitude in feet (e.g., 5000, 10000)
- **SPEED:** Enter speed in knots (100 to 500)
- **APPROACH:** Automatically configures the aircraft for approach
- **CLEARED TO LAND:** Issues final landing clearance

### Landing Aircraft

1. Turn the aircraft toward the center of the radar (the runway)
2. Descend to 3000 feet
3. Reduce speed to 180 knots
4. Click APPROACH when close to the runway
5. Click CLEARED TO LAND when very close to center
6. Successfully landed aircraft are removed and points are awarded

### Avoiding Conflicts

- Monitor the ALERTS panel for separation warnings
- Aircraft in conflict flash red
- Issue heading or altitude changes to restore separation
- Maintain 3 nautical miles horizontal or 1000 feet vertical separation

---

## Scoring System

- **Successful landing:** +100 points base, with bonuses for smooth approaches
- **Separation violation:** -50 points per occurrence
- **Efficiency bonus:** +10 points for optimal routing

Performance grades are calculated based on the ratio of landings to violations.

---

## Project Structure
```
Air-Traffic-Controller/
├── frontend/               # JavaScript browser application
│   ├── src/
│   │   ├── js/            # Application modules
│   │   ├── css/           # Stylesheets
│   │   └── assets/        # Audio and fonts
│   ├── index.html         # Entry point
│   └── package.json       # Node dependencies
│
├── backend/               # Python server
│   ├── src/              # Server modules
│   ├── requirements.txt  # Python dependencies
│   └── run.py           # Server entry point
│
├── cpp-physics/          # C++ WebAssembly module
│   ├── src/             # Physics source code
│   ├── CMakeLists.txt   # Build configuration
│   └── build.sh         # Build script
│
├── rust-safety/          # Rust WebAssembly module
│   ├── src/             # Safety source code
│   ├── Cargo.toml       # Package configuration
│   └── build.sh         # Build script
│
├── wasm/                 # Compiled WebAssembly output
├── docs/                 # Documentation
└── README.md            # This file
```

---

## Technical Specifications

- **Simulation rate:** 10 Hz (100ms update interval)
- **Radar range:** 50 nautical miles
- **Horizontal separation minimum:** 3 nautical miles
- **Vertical separation minimum:** 1,000 feet
- **Maximum aircraft per scenario:** 10
- **Supported aircraft types:** B737, A320, B777, A380, CRJ, E175

---

## Author

Built as a multi-language integration showcase demonstrating professional software architecture, real-time systems programming, and WebAssembly compilation from multiple source languages.