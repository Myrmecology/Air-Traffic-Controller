cmake_minimum_required(VERSION 3.15)
project(atc_physics)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

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

# Emscripten settings for WebAssembly
if(EMSCRIPTEN)
    set_target_properties(physics PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../wasm"
        SUFFIX ".js"
    )
    
    target_link_options(physics PRIVATE
        -O3
        -sWASM=1
        -sEXPORTED_FUNCTIONS=_updateAircraftPosition,_calculateTrajectory,_checkCollision,_malloc,_free
        -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
        -sALLOW_MEMORY_GROWTH=1
        -sMODULARIZE=1
        -sEXPORT_NAME=PhysicsModule
    )
endif()