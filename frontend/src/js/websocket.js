/**
 * WEBSOCKET CLIENT MODULE
 * Handles real-time communication with the Python backend
 */

export class WebSocketClient {
    constructor(url, simulator) {
        this.url = url;
        this.simulator = simulator;
        this.ws = null;
        this.reconnectInterval = 3000;
        this.reconnectTimer = null;
        this.isConnected = false;
        this.messageQueue = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.simulator.uiManager.updateConnectionStatus(true);
                    
                    // Send queued messages
                    this.flushMessageQueue();
                    
                    // Clear reconnect timer
                    if (this.reconnectTimer) {
                        clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = null;
                    }
                    
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.simulator.uiManager.updateConnectionStatus(false);
                    this.attemptReconnect();
                };

            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectTimer) return;

        console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000} seconds...`);
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect().catch(err => {
                console.error('Reconnection failed:', err);
            });
        }, this.reconnectInterval);
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'aircraft_update':
                    this.simulator.handleAircraftData(message.data);
                    break;
                
                case 'aircraft_landed':
                    this.handleAircraftLanded(message.data);
                    break;
                
                case 'aircraft_removed':
                    this.simulator.removeAircraft(message.aircraftId);
                    break;
                
                case 'scenario_started':
                    this.handleScenarioStarted(message.data);
                    break;
                
                case 'weather_update':
                    this.simulator.uiManager.updateWeather(message.data);
                    break;
                
                case 'conflict_alert':
                    this.handleConflictAlert(message.data);
                    break;
                
                case 'score_update':
                    this.handleScoreUpdate(message.data);
                    break;
                
                case 'system_message':
                    this.simulator.uiManager.showAlert(message.message, message.level);
                    break;
                
                case 'error':
                    console.error('Server error:', message.error);
                    this.simulator.uiManager.showAlert(message.error, 'critical');
                    break;
                
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    handleAircraftLanded(data) {
        console.log(`Aircraft ${data.callsign} landed`);
        this.simulator.stats.landings++;
        this.simulator.stats.score += data.points || 100;
        
        this.simulator.uiManager.showAlert(
            `${data.callsign} landed successfully (+${data.points || 100} points)`,
            'info'
        );
        
        // Remove aircraft after landing
        setTimeout(() => {
            this.simulator.removeAircraft(data.id);
        }, 2000);
    }

    handleScenarioStarted(data) {
        console.log('Scenario started:', data);
        this.simulator.uiManager.showAlert(
            `Scenario ${data.scenarioId} started - ${data.description}`,
            'info'
        );
    }

    handleConflictAlert(data) {
        console.warn('Conflict alert:', data);
        this.simulator.uiManager.showAlert(
            `CONFLICT ALERT: ${data.aircraft1} and ${data.aircraft2}`,
            'critical'
        );
    }

    handleScoreUpdate(data) {
        if (data.points) {
            this.simulator.stats.score += data.points;
        }
        if (data.message) {
            this.simulator.uiManager.showAlert(data.message, 'info');
        }
    }

    sendMessage(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, queuing message');
            this.messageQueue.push(message);
        }
    }

    sendCommand(command) {
        this.sendMessage({
            type: 'command',
            ...command
        });
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.isConnected = false;
    }

    getConnectionState() {
        if (!this.ws) return 'DISCONNECTED';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.OPEN:
                return 'CONNECTED';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'DISCONNECTED';
            default:
                return 'UNKNOWN';
        }
    }
}