/**
 * UI MANAGER MODULE
 * Handles all user interface interactions and updates
 */

export class UIManager {
    constructor(simulator) {
        this.simulator = simulator;
        this.flightStrips = new Map();
        this.commandModal = null;
        this.currentCommand = null;
    }

    initialize() {
        this.setupEventListeners();
        this.commandModal = document.getElementById('command-modal');
    }

    setupEventListeners() {
        // Scenario controls
        document.getElementById('start-scenario-btn').addEventListener('click', () => {
            const scenarioId = document.getElementById('scenario-select').value;
            this.simulator.startScenario(scenarioId);
        });

        document.getElementById('pause-btn').addEventListener('click', () => {
            this.simulator.pauseSimulation();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the simulation?')) {
                this.simulator.resetSimulation();
            }
        });

        // Command buttons
        const commandButtons = document.querySelectorAll('.cmd-btn');
        commandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.cmd;
                this.showCommandModal(command);
            });
        });

        // Modal controls
        document.getElementById('modal-confirm').addEventListener('click', () => {
            this.confirmCommand();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideCommandModal();
        });

        // Enter key in modal
        document.getElementById('command-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmCommand();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.commandModal.classList.contains('hidden')) {
                this.hideCommandModal();
            }
        });
    }

    showCommandModal(command) {
        if (!this.simulator.selectedAircraftId) {
            this.showAlert('No aircraft selected', 'warning');
            return;
        }

        this.currentCommand = command;
        const input = document.getElementById('command-input');
        const title = document.getElementById('modal-title');

        let placeholder = '';
        switch (command) {
            case 'heading':
                title.textContent = 'ENTER HEADING (0-359)';
                placeholder = 'e.g., 270';
                break;
            case 'altitude':
                title.textContent = 'ENTER ALTITUDE (feet)';
                placeholder = 'e.g., 10000';
                break;
            case 'speed':
                title.textContent = 'ENTER SPEED (knots)';
                placeholder = 'e.g., 250';
                break;
            case 'approach':
                this.simulator.issueCommand('approach', null);
                return;
            case 'cleared':
                this.simulator.issueCommand('cleared', null);
                return;
        }

        input.placeholder = placeholder;
        input.value = '';
        this.commandModal.classList.remove('hidden');
        input.focus();
    }

    hideCommandModal() {
        this.commandModal.classList.add('hidden');
        this.currentCommand = null;
    }

    confirmCommand() {
        const input = document.getElementById('command-input');
        const value = input.value.trim();

        if (!value) {
            this.showAlert('Please enter a value', 'warning');
            return;
        }

        const numValue = parseInt(value);

        // Validate input
        let valid = true;
        switch (this.currentCommand) {
            case 'heading':
                if (numValue < 0 || numValue > 359) {
                    this.showAlert('Heading must be between 0 and 359', 'warning');
                    valid = false;
                }
                break;
            case 'altitude':
                if (numValue < 0 || numValue > 50000) {
                    this.showAlert('Altitude must be between 0 and 50000 feet', 'warning');
                    valid = false;
                }
                break;
            case 'speed':
                if (numValue < 100 || numValue > 500) {
                    this.showAlert('Speed must be between 100 and 500 knots', 'warning');
                    valid = false;
                }
                break;
        }

        if (valid) {
            this.simulator.issueCommand(this.currentCommand, numValue);
            this.hideCommandModal();
        }
    }

    addFlightStrip(aircraft) {
        const container = document.getElementById('flight-strips-container');
        
        const strip = document.createElement('div');
        strip.className = 'flight-strip';
        strip.dataset.aircraftId = aircraft.id;
        
        strip.innerHTML = `
            <div class="strip-callsign">${aircraft.callsign}</div>
            <div class="strip-info">
                <span>ALT: <span class="strip-altitude">${Math.round(aircraft.altitude)}</span></span>
                <span>SPD: <span class="strip-speed">${Math.round(aircraft.speed)}</span></span>
            </div>
            <div class="strip-info">
                <span>HDG: <span class="strip-heading">${Math.round(aircraft.heading)}</span></span>
                <span>TYPE: ${aircraft.type}</span>
            </div>
        `;
        
        strip.addEventListener('click', () => {
            this.simulator.selectAircraft(aircraft.id);
        });
        
        container.appendChild(strip);
        this.flightStrips.set(aircraft.id, strip);
    }

    updateFlightStrip(aircraft) {
        const strip = this.flightStrips.get(aircraft.id);
        if (!strip) return;

        strip.querySelector('.strip-altitude').textContent = Math.round(aircraft.altitude);
        strip.querySelector('.strip-speed').textContent = Math.round(aircraft.speed);
        strip.querySelector('.strip-heading').textContent = Math.round(aircraft.heading);

        // Update strip state
        strip.classList.remove('selected', 'warning', 'critical');
        if (aircraft.isSelected) {
            strip.classList.add('selected');
        }
        if (aircraft.inConflict) {
            strip.classList.add('critical');
        }
    }

    removeFlightStrip(id) {
        const strip = this.flightStrips.get(id);
        if (strip) {
            strip.remove();
            this.flightStrips.delete(id);
        }
    }

    updateSelectedAircraft(aircraft) {
        const callsignEl = document.getElementById('selected-callsign');
        if (aircraft) {
            callsignEl.textContent = `${aircraft.callsign} - ${aircraft.type}`;
        } else {
            callsignEl.textContent = 'NO AIRCRAFT SELECTED';
        }

        // Update all flight strips
        this.flightStrips.forEach((strip, id) => {
            strip.classList.toggle('selected', id === aircraft?.id);
        });
    }

    clearSelectedAircraft() {
        this.updateSelectedAircraft(null);
    }

    updateStats(stats) {
        document.getElementById('stat-aircraft').textContent = stats.aircraftCount;
        document.getElementById('stat-landings').textContent = stats.landings;
        document.getElementById('stat-score').textContent = stats.score;
        document.getElementById('stat-violations').textContent = stats.violations;
    }

    addCommandHistory(command) {
        const historyLog = document.getElementById('history-log');
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        entry.innerHTML = `<span class="timestamp">${timeStr}</span> ${command}`;
        
        historyLog.appendChild(entry);
        
        // Auto-scroll to bottom
        historyLog.scrollTop = historyLog.scrollHeight;
        
        // Keep only last 50 entries
        while (historyLog.children.length > 50) {
            historyLog.removeChild(historyLog.firstChild);
        }
    }

    showAlert(message, level = 'info') {
        const alertsContainer = document.getElementById('alerts-container');
        const alert = document.createElement('div');
        
        alert.className = 'alert-message';
        if (level === 'warning') alert.classList.add('alert-warning');
        if (level === 'critical') alert.classList.add('alert-critical');
        
        alert.textContent = message;
        
        alertsContainer.appendChild(alert);
        
        // Auto-scroll to bottom
        alertsContainer.scrollTop = alertsContainer.scrollHeight;
        
        // Remove after 10 seconds for non-critical alerts
        if (level !== 'critical') {
            setTimeout(() => {
                alert.classList.add('fade-out');
                setTimeout(() => alert.remove(), 300);
            }, 10000);
        }
        
        // Keep only last 20 alerts
        while (alertsContainer.children.length > 20) {
            alertsContainer.removeChild(alertsContainer.firstChild);
        }
    }

    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connection-status');
        if (connected) {
            statusEl.textContent = 'ONLINE';
            statusEl.className = 'status-connected';
        } else {
            statusEl.textContent = 'OFFLINE';
            statusEl.className = 'status-disconnected';
        }
    }

    updateWeather(weather) {
        document.getElementById('wind-data').textContent = 
            `${weather.windDirection.toString().padStart(3, '0')}/${weather.windSpeed}`;
        document.getElementById('visibility-data').textContent = weather.visibility + ' SM';
        document.getElementById('ceiling-data').textContent = weather.ceiling;
        document.getElementById('altimeter-data').textContent = weather.altimeter.toFixed(2);
    }

    updatePauseButton(isPaused) {
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE';
    }

    reset() {
        // Clear flight strips
        const container = document.getElementById('flight-strips-container');
        container.innerHTML = '';
        this.flightStrips.clear();

        // Clear command history
        const historyLog = document.getElementById('history-log');
        historyLog.innerHTML = '';

        // Clear alerts
        const alertsContainer = document.getElementById('alerts-container');
        alertsContainer.innerHTML = '<div class="alert-message">SYSTEM READY</div>';

        // Reset selected aircraft
        this.clearSelectedAircraft();

        // Reset stats
        this.updateStats({
            aircraftCount: 0,
            landings: 0,
            score: 0,
            violations: 0
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `<div class="toast-message">${message}</div>`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}