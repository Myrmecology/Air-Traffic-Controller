#!/bin/bash

echo "======================================"
echo "Building C++ Physics Module (WASM)"
echo "======================================"

# Check if Emscripten is available
if ! command -v emcc &> /dev/null
then
    echo "ERROR: Emscripten not found!"
    echo "Please install Emscripten SDK:"
    echo "https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Create build directory
mkdir -p build
cd build

# Configure with CMake
echo "Configuring with CMake..."
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release

# Build
echo "Building..."
emmake make

# Check if build was successful
if [ -f "../wasm/physics.wasm" ]; then
    echo "======================================"
    echo "Build successful!"
    echo "Output: wasm/physics.wasm"
    echo "======================================"
else
    echo "======================================"
    echo "Build failed!"
    echo "======================================"
    exit 1
fi