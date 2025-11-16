# Air Traffic Controller Simulator

A professional-grade, browser-based Air Traffic Control (ATC) simulator featuring authentic radar displays, realistic flight dynamics, and multi-language architecture for optimal performance.

## 🎯 Project Overview

This simulator provides an immersive ATC experience with:
- **Authentic radar visualization** with CRT-style displays
- **Realistic flight physics** and aircraft behavior
- **Progressive difficulty scenarios** from simple to complex operations
- **Real-time conflict detection** and separation monitoring
- **Professional UI** modeled after actual ATC systems

## 🏗️ Architecture

This project utilizes a multi-language architecture for optimal performance:

- **JavaScript**: Frontend rendering, Canvas-based radar display, WebSocket client, UI interactions
- **Python**: Backend server, WebSocket handler, flight simulation logic, scenario management
- **C++**: High-performance physics calculations (compiled to WebAssembly)
- **Rust**: Safety-critical operations and separation monitoring (compiled to WebAssembly)

## 📁 Project Structure
```
├── frontend/          # Browser-based UI and rendering
│   ├── src/
│   │   ├── js/       # JavaScript modules
│   │   ├── css/      # Stylesheets
│   │   └── assets/   # Audio, fonts, images
│   └── index.html
├── backend/           # Python server
│   └── src/          # Server modules
├── cpp-physics/       # C++ physics engine
│   └── src/          # Physics calculations
├── rust-safety/       # Rust safety module
│   └── src/          # Separation monitoring
├── wasm/             # Compiled WebAssembly modules
└── docs/             # Documentation
```

## 🚀 Features

### Core Functionality
- Real-time radar display with rotating sweep animation
- Multiple aircraft with unique flight characteristics
- Vector projection showing future flight paths
- Flight data blocks (callsign, altitude, speed, heading)
- Interactive command system for aircraft control

### Flight Operations
- Turn heading commands
- Altitude assignments (climb/descend)
- Speed adjustments
- Landing clearances
- Go-around procedures

### Safety Systems
- Separation monitoring (3nm horizontal, 1000ft vertical)
- Conflict prediction and alerts
- Wake turbulence warnings
- Emergency handling (fuel, medical, mechanical)

### Scenarios
- Progressive difficulty levels
- Various weather conditions
- Multiple runway operations
- Special emergency situations

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | JavaScript (ES6+), Canvas API | UI and rendering |
| Backend | Python 3.11+, FastAPI/Flask | Server and simulation |
| Physics | C++ 17, Emscripten | High-performance calculations |
| Safety | Rust 1.70+, wasm-pack | Memory-safe critical operations |
| Real-time | WebSockets | Bidirectional communication |

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Rust** 1.70+ (with wasm-pack)
- **C++ compiler** (GCC/Clang) and CMake
- **Emscripten** SDK for WebAssembly compilation

## ⚙️ Installation

Detailed setup instructions available in [docs/SETUP.md](docs/SETUP.md)

### Quick Start

1. **Clone repository**
```bash
git clone <repository-url>
cd atc-simulator
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Build C++ physics module**
```bash
cd cpp-physics
./build.sh
```

5. **Build Rust safety module**
```bash
cd rust-safety
./build.sh
```

6. **Start the application**
```bash
# Terminal 1: Start backend
cd backend
python run.py

# Terminal 2: Start frontend dev server
cd frontend
npm start
```

## 🎮 Usage

1. Open browser to `http://localhost:3000`
2. Select a scenario from the menu
3. Monitor aircraft on radar display
4. Click aircraft to select and issue commands
5. Maintain safe separation and sequence aircraft for landing
6. Complete scenarios to unlock higher difficulty levels

## 📊 Scoring System

- **Points awarded for**: Safe landings, efficient routing, fuel savings
- **Penalties for**: Separation violations, missed approaches, delays
- **Multipliers**: Complexity level, weather difficulty, traffic density

## 🔒 Security

- All sensitive configuration excluded via `.gitignore`
- No API keys or credentials in source code
- YubiKey integration support for secure authentication
- CORS and WebSocket security implemented

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Architecture Details](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)

## 🤝 Contributing

This is a personal project for educational and demonstration purposes.

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🎥 Demo

YouTube video demonstration: [Coming Soon]

## 👨‍💻 Author

Built as a multi-language integration showcase demonstrating professional software architecture and real-time systems programming.

---

**Status**: 🚧 In Active Development