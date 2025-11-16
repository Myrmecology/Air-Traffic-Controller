#!/bin/bash

echo "======================================"
echo "Building Rust Safety Module (WASM)"
echo "======================================"

# Check if Rust is installed
if ! command -v cargo &> /dev/null
then
    echo "ERROR: Rust not found!"
    echo "Please install Rust from https://rustup.rs/"
    exit 1
fi

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null
then
    echo "Installing wasm-pack..."
    cargo install wasm-pack
fi

# Build with wasm-pack
echo "Building with wasm-pack..."
wasm-pack build --target web --out-dir ../wasm --release

# Check if build was successful
if [ -f "../wasm/atc_safety_bg.wasm" ]; then
    # Rename to safety.wasm for consistency
    mv ../wasm/atc_safety_bg.wasm ../wasm/safety.wasm
    mv ../wasm/atc_safety.js ../wasm/safety.js
    
    echo "======================================"
    echo "Build successful!"
    echo "Output: wasm/safety.wasm"
    echo "======================================"
else
    echo "======================================"
    echo "Build failed!"
    echo "======================================"
    exit 1
fi