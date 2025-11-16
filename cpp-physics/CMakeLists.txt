cmake_minimum_required(VERSION 3.15)
project(atc_physics)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Emscripten settings for WebAssembly
if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    
    # Emscripten compiler flags
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_FUNCTIONS='[\"_updateAircraftPosition\",\"_calculateTrajectory\",\"_checkCollision\",\"_malloc\",\"_free\"]'")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_RUNTIME_METHODS='[\"ccall\",\"cwrap\"]'")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ALLOW_MEMORY_GROWTH=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s MODULARIZE=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORT_NAME='PhysicsModule'")
endif()

# Source files
set(SOURCES
    src/physics.cpp
    src/trajectory.cpp
    src/collision.cpp
    src/bindings.cpp
)

# Header files
set(HEADERS
    src/physics.h
    src/trajectory.h
    src/collision.h
)

# Create executable
add_executable(physics ${SOURCES} ${HEADERS})

# Set output directory
set_target_properties(physics PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../wasm"
)

# Installation
install(TARGETS physics
    RUNTIME DESTINATION ${CMAKE_SOURCE_DIR}/../wasm
)