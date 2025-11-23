/**
 * AIR TRAFFIC CONTROLLER SIMULATOR
 * Main Application Entry Point
 */

import { RadarDisplay } from './radar.js';
import { WebSocketClient } from './websocket.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';
import { formatTime, degToRad } from './utils.js';

class ATCSimulator {
    constructor() {
        this.radarDisplay = null;
        this.wsClient = null;
        this.audioManager = null;
        this.uiManager = null;
        
        this.aircraft = new Map();
        this.selectedAircraftId = null;
        this.isPaused = false;
        this.currentScenario = null;
        
        this.stats = {
            aircraftCount: 0,
            landings: 0,
            score: 0,
            violations: 0
        };
        
        this.wasmModules = {
            physics: null,
            safety: null
        };
        
        this.config = {
            radarRange: 50, // nautical miles
            updateRate: 100, // ms
            separationMinimum: 3, // nautical miles
            verticalSeparation: 1000 // feet
        };
    }

    async initialize() {
        try {
            this.updateLoadingStatus('Initializing UI...');
            await this.initializeUI();
            
            this.updateLoadingStatus('Loading WASM modules...');
            await this.loadWASMModules();
            
            this.updateLoadingStatus('Initializing radar display...');
            await this.initializeRadar();
            
            this.updateLoadingStatus('Connecting to server...');
            await this.initializeWebSocket();
            
            this.updateLoadingStatus('Initializing audio system...');
            await this.initializeAudio();
            
            this.updateLoadingStatus('System ready!');
            await this.delay(500);
            
            this.hideLoadingScreen();
            this.startUpdateLoop();
            
            console.log('ATC Simulator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize simulator:', error);
            this.showError('Failed to initialize system: ' + error.message);
        }
    }

    async initializeUI() {
        this.uiManager = new UIManager(this);
        this.uiManager.initialize();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    async loadWASMModules() {
        try {
            // Load C++ Physics Module
            const physicsResponse = await fetch('../wasm/physics.wasm');
            if (physicsResponse.ok) {
                const physicsBuffer = await physicsResponse.arrayBuffer();
                const physicsModule = await WebAssembly.instantiate(physicsBuffer);
                this.wasmModules.physics = physicsModule.instance.exports;
                console.log('C++ Physics module loaded');
            } else {
                console.warn('Physics WASM not found, using JavaScript fallback');
            }
            
            // Load Rust Safety Module
            const safetyResponse = await fetch('../wasm/safety.wasm');
            if (safetyResponse.ok) {
                const safetyBuffer = await safetyResponse.arrayBuffer();
                const safetyModule = await WebAssembly.instantiate(safetyBuffer);
                this.wasmModules.safety = safetyModule.instance.exports;
                console.log('Rust Safety module loaded');
            } else {
                console.warn('Safety WASM not found, using JavaScript fallback');
            }
            
            this.updateLoadingProgress(40);
        } catch (error) {
            console.warn('WASM modules not available, using JavaScript fallback:', error);
        }
    }

    async initializeRadar() {
        const canvas = document.getElementById('radar-canvas');
        this.radarDisplay = new RadarDisplay(canvas, this);
        this.radarDisplay.initialize();
        this.updateLoadingProgress(60);
    }

    async initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
        
        this.wsClient = new WebSocketClient(wsUrl, this);
        await this.wsClient.connect();
        this.updateLoadingProgress(80);
    }

    async initializeAudio() {
        this.audioManager = new AudioManager();
        await this.audioManager.initialize();
        this.updateLoadingProgress(100);
    }

    startUpdateLoop() {
        setInterval(() => {
            if (!this.isPaused) {
                this.update();
            }
        }, this.config.updateRate);
    }

    update() {
        // Update aircraft positions
        this.updateAircraft();
        
        // Check for conflicts
        this.checkSeparation();
        
        // Update radar display
        if (this.radarDisplay) {
            this.radarDisplay.render();
        }
        
        // Update UI
        this.updateStats();
    }

    updateAircraft() {
        const deltaTime = this.config.updateRate / 1000; // Convert to seconds
        
        this.aircraft.forEach((aircraft) => {
            // Use WASM physics if available, otherwise JavaScript fallback
            if (this.wasmModules.physics && this.wasmModules.physics.updateAircraftPosition) {
                // Call C++ WASM function for physics calculations
                // This would need proper data marshaling
                this.updateAircraftJS(aircraft, deltaTime);
            } else {
                this.updateAircraftJS(aircraft, deltaTime);
            }
        });
    }

    updateAircraftJS(aircraft, deltaTime) {
        // Simple physics simulation (fallback)
        const speedNMPerSecond = aircraft.speed / 3600; // Convert knots to NM/s
        
        // Update position based on heading
        const headingRad = degToRad(aircraft.heading);
        aircraft.x += Math.sin(headingRad) * speedNMPerSecond * deltaTime;
        aircraft.y += Math.cos(headingRad) * speedNMPerSecond * deltaTime;
        
        // Smooth altitude changes
        if (aircraft.targetAltitude !== aircraft.altitude) {
            const altDiff = aircraft.targetAltitude - aircraft.altitude;
            const climbRate = 1500 * deltaTime; // 1500 feet per second
            if (Math.abs(altDiff) < climbRate) {
                aircraft.altitude = aircraft.targetAltitude;
            } else {
                aircraft.altitude += Math.sign(altDiff) * climbRate;
            }
        }
        
        // Smooth heading changes
        if (aircraft.targetHeading !== aircraft.heading) {
            const headingDiff = this.getHeadingDifference(aircraft.heading, aircraft.targetHeading);
            const turnRate = 3 * deltaTime; // 3 degrees per second
            if (Math.abs(headingDiff) < turnRate) {
                aircraft.heading = aircraft.targetHeading;
            } else {
                aircraft.heading += Math.sign(headingDiff) * turnRate;
                aircraft.heading = (aircraft.heading + 360) % 360;
            }
        }
        
        // Smooth speed changes
        if (aircraft.targetSpeed !== aircraft.speed) {
            const speedDiff = aircraft.targetSpeed - aircraft.speed;
            const accelRate = 10 * deltaTime; // 10 knots per second
            if (Math.abs(speedDiff) < accelRate) {
                aircraft.speed = aircraft.targetSpeed;
            } else {
                aircraft.speed += Math.sign(speedDiff) * accelRate;
            }
        }
    }

    getHeadingDifference(current, target) {
        let diff = target - current;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return diff;
    }

    checkSeparation() {
        const aircraftArray = Array.from(this.aircraft.values());
        
        for (let i = 0; i < aircraftArray.length; i++) {
            for (let j = i + 1; j < aircraftArray.length; j++) {
                const a1 = aircraftArray[i];
                const a2 = aircraftArray[j];
                
                // Use Rust WASM for safety-critical checks if available
                let violation = false;
                
                if (this.wasmModules.safety && this.wasmModules.safety.checkSeparation) {
                    // Call Rust WASM function
                    // This would need proper data marshaling
                    violation = this.checkSeparationJS(a1, a2);
                } else {
                    violation = this.checkSeparationJS(a1, a2);
                }
                
                if (violation) {
                    this.handleSeparationViolation(a1, a2);
                }
            }
        }
    }

    checkSeparationJS(a1, a2) {
        // Calculate horizontal distance
        const dx = a1.x - a2.x;
        const dy = a1.y - a2.y;
        const horizontalDist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate vertical separation
        const verticalDist = Math.abs(a1.altitude - a2.altitude);
        
        // Check if separation is violated
        if (horizontalDist < this.config.separationMinimum && 
            verticalDist < this.config.verticalSeparation) {
            return true;
        }
        
        return false;
    }

    handleSeparationViolation(a1, a2) {
        console.warn(`Separation violation: ${a1.callsign} and ${a2.callsign}`);
        
        // Mark aircraft as in conflict
        a1.inConflict = true;
        a2.inConflict = true;
        
        // Update stats
        this.stats.violations++;
        this.stats.score -= 50;
        
        // Show alert
        this.uiManager.showAlert(
            `SEPARATION VIOLATION: ${a1.callsign} and ${a2.callsign}`,
            'critical'
        );
        
        // Play alert sound
        if (this.audioManager) {
            this.audioManager.playAlert('conflict');
        }
    }

    handleAircraftData(data) {
        // If empty array, clear everything
        if (!data || data.length === 0) {
            this.aircraft.clear();
            this.selectedAircraftId = null;
            this.stats.aircraftCount = 0;
            
            // Clear all flight strips
            const container = document.getElementById('flight-strips-container');
            if (container) {
                container.innerHTML = '';
            }
            this.uiManager.flightStrips.clear();
            this.uiManager.clearSelectedAircraft();
            return;
        }
        
        // Get IDs from server data
        const serverIds = new Set(data.map(a => a.id));
        
        // Remove aircraft not in server data
        const toRemove = [];
        this.aircraft.forEach((aircraft, id) => {
            if (!serverIds.has(id)) {
                toRemove.push(id);
            }
        });
        toRemove.forEach(id => {
            this.aircraft.delete(id);
            this.uiManager.removeFlightStrip(id);
        });
        
        // Update or add aircraft from server
        data.forEach(aircraftData => {
            if (!this.aircraft.has(aircraftData.id)) {
                this.addAircraft(aircraftData);
            } else {
                this.updateAircraftData(aircraftData);
            }
        });
        
        // Update aircraft count
        this.stats.aircraftCount = this.aircraft.size;
    }

    addAircraft(data) {
        this.aircraft.set(data.id, {
            id: data.id,
            callsign: data.callsign,
            type: data.type,
            x: data.x,
            y: data.y,
            altitude: data.altitude,
            heading: data.heading,
            speed: data.speed,
            targetAltitude: data.targetAltitude || data.altitude,
            targetHeading: data.targetHeading || data.heading,
            targetSpeed: data.targetSpeed || data.speed,
            inConflict: data.inConflict || false,
            isSelected: false
        });
        
        this.stats.aircraftCount = this.aircraft.size;
        this.uiManager.addFlightStrip(data);
    }

    updateAircraftData(data) {
        const aircraft = this.aircraft.get(data.id);
        if (aircraft) {
            aircraft.x = data.x;
            aircraft.y = data.y;
            aircraft.altitude = data.altitude;
            aircraft.heading = data.heading;
            aircraft.speed = data.speed;
            aircraft.targetAltitude = data.targetAltitude || data.altitude;
            aircraft.targetHeading = data.targetHeading || data.heading;
            aircraft.targetSpeed = data.targetSpeed || data.speed;
            aircraft.inConflict = data.inConflict || false;
            
            // Update flight strip
            this.uiManager.updateFlightStrip(aircraft);
        }
    }

    removeAircraft(id) {
        this.aircraft.delete(id);
        this.stats.aircraftCount = this.aircraft.size;
        this.uiManager.removeFlightStrip(id);
        
        if (this.selectedAircraftId === id) {
            this.selectedAircraftId = null;
            this.uiManager.clearSelectedAircraft();
        }
    }

    selectAircraft(id) {
        // Deselect previous
        if (this.selectedAircraftId) {
            const prev = this.aircraft.get(this.selectedAircraftId);
            if (prev) prev.isSelected = false;
        }
        
        // Select new
        this.selectedAircraftId = id;
        const aircraft = this.aircraft.get(id);
        if (aircraft) {
            aircraft.isSelected = true;
            this.uiManager.updateSelectedAircraft(aircraft);
        }
    }

    issueCommand(command, value) {
        if (!this.selectedAircraftId) return;
        
        const aircraft = this.aircraft.get(this.selectedAircraftId);
        if (!aircraft) return;
        
        let commandText = '';
        
        switch (command) {
            case 'heading':
                aircraft.targetHeading = parseInt(value);
                commandText = `${aircraft.callsign}, turn heading ${value}`;
                break;
            case 'altitude':
                aircraft.targetAltitude = parseInt(value);
                commandText = `${aircraft.callsign}, ${value > aircraft.altitude ? 'climb' : 'descend'} and maintain ${value}`;
                break;
            case 'speed':
                aircraft.targetSpeed = parseInt(value);
                commandText = `${aircraft.callsign}, ${value > aircraft.speed ? 'increase' : 'reduce'} speed to ${value} knots`;
                break;
            case 'approach':
                commandText = `${aircraft.callsign}, cleared for approach`;
                break;
            case 'cleared':
                commandText = `${aircraft.callsign}, cleared to land`;
                break;
        }
        
        // Send command to server
        if (this.wsClient) {
            this.wsClient.sendCommand({
                aircraftId: this.selectedAircraftId,
                command: command,
                value: value
            });
        }
        
        // Log command
        this.uiManager.addCommandHistory(commandText);
        
        // Play audio
        if (this.audioManager) {
            this.audioManager.playSound('command');
        }
    }

    startScenario(scenarioId) {
        console.log(`Starting scenario ${scenarioId}`);
        this.currentScenario = scenarioId;
        
        // Clear existing aircraft
        this.aircraft.clear();
        this.selectedAircraftId = null;
        
        // Reset stats
        this.stats = {
            aircraftCount: 0,
            landings: 0,
            score: 0,
            violations: 0
        };
        
        // Reset UI
        this.uiManager.reset();
        
        // Clear radar
        if (this.radarDisplay) {
            this.radarDisplay.clear();
        }
        
        // Request scenario from server
        if (this.wsClient) {
            this.wsClient.sendMessage({
                type: 'start_scenario',
                scenarioId: scenarioId
            });
        }
    }

    pauseSimulation() {
        this.isPaused = !this.isPaused;
        this.uiManager.updatePauseButton(this.isPaused);
    }

    resetSimulation() {
        // Clear local state
        this.aircraft.clear();
        this.selectedAircraftId = null;
        this.currentScenario = null;
        this.isPaused = false;
        
        // Reset stats
        this.stats = {
            aircraftCount: 0,
            landings: 0,
            score: 0,
            violations: 0
        };
        
        // Reset UI
        this.uiManager.reset();
        
        // Clear radar
        if (this.radarDisplay) {
            this.radarDisplay.clear();
        }
        
        // Tell server to reset
        if (this.wsClient) {
            this.wsClient.sendMessage({
                type: 'reset'
            });
        }
    }

    updateStats() {
        this.uiManager.updateStats(this.stats);
    }

    updateClock() {
        const now = new Date();
        const timeString = formatTime(now);
        document.getElementById('clock-display').textContent = timeString + ' UTC';
    }

    updateLoadingStatus(status) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    updateLoadingProgress(percent) {
        const progressEl = document.getElementById('loading-progress');
        if (progressEl) {
            progressEl.style.width = percent + '%';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 300);
        }
    }

    showError(message) {
        alert('ERROR: ' + message);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const simulator = new ATCSimulator();
    simulator.initialize();
    
    // Make simulator globally accessible for debugging
    window.atcSimulator = simulator;
});