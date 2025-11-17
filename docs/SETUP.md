# ATC Simulator Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (3.11 or higher)
   - Download from: https://www.python.org/
   - Verify: `python --version` or `python3 --version`

3. **Rust** (1.70 or higher)
   - Install from: https://rustup.rs/
   - Run: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Verify: `cargo --version`

4. **wasm-pack** (for Rust WASM)
   - Install: `cargo install wasm-pack`
   - Verify: `wasm-pack --version`

5. **Emscripten** (for C++ WASM)
   - Download from: https://emscripten.org/docs/getting_started/downloads.html
   - Follow installation instructions for your OS
   - Verify: `emcc --version`

6. **CMake** (3.15 or higher)
   - Windows: Download from https://cmake.org/download/
   - Mac: `brew install cmake`
   - Linux: `sudo apt install cmake`
   - Verify: `cmake --version`

## Installation Steps

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
# Or on some systems:
# pip3 install -r requirements.txt
cd ..
```

### Step 3: Build C++ Physics Module
```bash
cd cpp-physics
chmod +x build.sh
./build.sh
cd ..
```

**Expected Output:**
- `wasm/physics.wasm`
- `wasm/physics.js`

**Troubleshooting C++:**
- If Emscripten not found: Install Emscripten SDK and activate it
- If build fails: Check CMake is installed
- On Windows: Use Git Bash or WSL to run the build script

### Step 4: Build Rust Safety Module
```bash
cd rust-safety
chmod +x build.sh
./build.sh
cd ..
```

**Expected Output:**
- `wasm/safety.wasm`
- `wasm/safety.js`

**Troubleshooting Rust:**
- If wasm-pack not found: `cargo install wasm-pack`
- If build fails: Ensure Rust is in your PATH

## Running the Application

### Terminal 1: Start Backend Server
```bash
cd backend
python run.py
# Or: python3 run.py
```

**Expected Output:**
```
==============================
AIR TRAFFIC CONTROLLER SIMULATOR - Backend Server
==============================
Starting server on http://localhost:8000
WebSocket endpoint: ws://localhost:8000/ws
==============================
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Start Frontend Server
```bash
cd frontend
npm start
# Or: python -m http.server 3000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
```

### Step 3: Open Browser

Navigate to: **http://localhost:3000**

## Verification Checklist

✅ Backend running on port 8000
✅ Frontend running on port 3000
✅ Browser loads the radar interface
✅ Connection status shows "ONLINE"
✅ WASM modules loaded (check browser console)

## Common Issues

### WASM Files Not Found

**Problem:** Browser console shows 404 errors for .wasm files

**Solution:**
1. Verify WASM files exist in `/wasm` directory
2. Check file paths in `index.html`
3. Rebuild WASM modules

### WebSocket Connection Failed

**Problem:** Connection status shows "OFFLINE"

**Solution:**
1. Ensure backend is running on port 8000
2. Check firewall settings
3. Verify WebSocket URL in browser console

### Python Import Errors

**Problem:** `ModuleNotFoundError` when starting backend

**Solution:**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### CORS Errors

**Problem:** Browser shows CORS policy errors

**Solution:**
- Backend already has CORS middleware configured
- Ensure backend is running before opening frontend
- Clear browser cache

## Development Mode

For development with auto-reload:

**Backend:**
```bash
cd backend
uvicorn src.server:app --reload --port 8000
```

**Frontend:**
- Use a development server like `live-server`
- Or install: `npm install -g live-server`
- Run: `live-server --port=3000`

## Production Build

For production deployment:

1. Build optimized WASM modules with release flags (already done)
2. Minify JavaScript and CSS
3. Configure proper CORS for your domain
4. Use a production WSGI server (like Gunicorn)
5. Set up HTTPS

## Port Configuration

If ports 3000 or 8000 are in use:

**Change Backend Port:**
Edit `backend/run.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Changed port
```

**Change Frontend Port:**
```bash
python -m http.server 3001  # Use different port
```

Update WebSocket URL in `frontend/src/js/main.js`:
```javascript
const wsUrl = `${protocol}//${window.location.hostname}:8001/ws`;
```

## Next Steps

After successful setup:
1. Start a scenario from the UI
2. Monitor aircraft on radar
3. Issue commands to aircraft
4. Check scoring system

See [API.md](API.md) for API documentation.
See [ARCHITECTURE.md](ARCHITECTURE.md) for system architecture details.