/**
 * RADAR DISPLAY MODULE
 * Handles Canvas rendering of radar scope and aircraft
 */

export class RadarDisplay {
    constructor(canvas, simulator) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.simulator = simulator;
        
        this.centerX = 0;
        this.centerY = 0;
        this.scale = 1;
        this.radarRange = 50; // nautical miles
        
        this.sweepAngle = 0;
        this.sweepSpeed = 2; // degrees per frame
        
        this.colors = {
            background: '#000000',
            radarPrimary: '#00ffff',
            radarSecondary: '#00ff00',
            radarDim: '#004d4d',
            aircraftNormal: '#4db8ff',
            aircraftSelected: '#ffffff',
            aircraftWarning: '#ffaa00',
            aircraftCritical: '#ff0000',
            runway: '#2d5016',
            runwayOutline: '#ffffff'
        };
        
        this.runways = [
            { x1: -2, y1: -10, x2: -2, y2: 10, heading: 0, name: '36/18' }
        ];
    }

    initialize() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Calculate scale (pixels per nautical mile)
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.scale = (minDimension * 0.9) / (this.radarRange * 2);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw radar elements
        this.drawRangeRings();
        this.drawCompassHeadings();
        this.drawRunways();
        this.drawRadarSweep();
        this.drawAircraft();
        this.drawVectorLines();
    }

    drawRangeRings() {
        this.ctx.strokeStyle = this.colors.radarDim;
        this.ctx.lineWidth = 1;
        
        const rings = [10, 20, 30, 40, 50];
        
        rings.forEach(range => {
            const radius = range * this.scale;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw range label
            this.ctx.fillStyle = this.colors.radarDim;
            this.ctx.font = '10px monospace';
            this.ctx.fillText(range + 'NM', this.centerX + 5, this.centerY - radius + 5);
        });
    }

    drawCompassHeadings() {
        this.ctx.fillStyle = this.colors.radarDim;
        this.ctx.strokeStyle = this.colors.radarDim;
        this.ctx.font = '12px monospace';
        this.ctx.lineWidth = 1;
        
        const headings = [
            { deg: 0, label: 'N' },
            { deg: 45, label: '045' },
            { deg: 90, label: 'E' },
            { deg: 135, label: '135' },
            { deg: 180, label: 'S' },
            { deg: 225, label: '225' },
            { deg: 270, label: 'W' },
            { deg: 315, label: '315' }
        ];
        
        const outerRadius = this.radarRange * this.scale;
        
        headings.forEach(heading => {
            const rad = (heading.deg - 90) * Math.PI / 180;
            const x = this.centerX + Math.cos(rad) * outerRadius;
            const y = this.centerY + Math.sin(rad) * outerRadius;
            
            // Draw tick mark
            const tickLength = 10;
            const x1 = this.centerX + Math.cos(rad) * (outerRadius - tickLength);
            const y1 = this.centerY + Math.sin(rad) * (outerRadius - tickLength);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            // Draw label
            const labelX = this.centerX + Math.cos(rad) * (outerRadius + 20);
            const labelY = this.centerY + Math.sin(rad) * (outerRadius + 20);
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(heading.label, labelX, labelY);
        });
    }

    drawRunways() {
        this.ctx.strokeStyle = this.colors.runwayOutline;
        this.ctx.fillStyle = this.colors.runway;
        this.ctx.lineWidth = 2;
        
        this.runways.forEach(runway => {
            const x1 = this.centerX + runway.x1 * this.scale;
            const y1 = this.centerY - runway.y1 * this.scale;
            const x2 = this.centerX + runway.x2 * this.scale;
            const y2 = this.centerY - runway.y2 * this.scale;
            
            // Draw runway
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Draw centerline dashes
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = this.colors.runwayOutline;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }

    drawRadarSweep() {
        // Rotate sweep angle
        this.sweepAngle = (this.sweepAngle + this.sweepSpeed) % 360;
        
        const rad = (this.sweepAngle - 90) * Math.PI / 180;
        const radius = this.radarRange * this.scale;
        
        // Draw sweep line with gradient
        const gradient = this.ctx.createLinearGradient(
            this.centerX,
            this.centerY,
            this.centerX + Math.cos(rad) * radius,
            this.centerY + Math.sin(rad) * radius
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(
            this.centerX + Math.cos(rad) * radius,
            this.centerY + Math.sin(rad) * radius
        );
        this.ctx.stroke();
    }

    drawAircraft() {
        this.simulator.aircraft.forEach(aircraft => {
            const screenX = this.centerX + aircraft.x * this.scale;
            const screenY = this.centerY - aircraft.y * this.scale;
            
            // Determine color based on state
            let color = this.colors.aircraftNormal;
            if (aircraft.isSelected) {
                color = this.colors.aircraftSelected;
            } else if (aircraft.inConflict) {
                color = this.colors.aircraftCritical;
            }
            
            // Draw aircraft symbol (triangle pointing in heading direction)
            this.drawAircraftSymbol(screenX, screenY, aircraft.heading, color);
            
            // Draw data block
            this.drawDataBlock(screenX, screenY, aircraft, color);
        });
    }

    drawAircraftSymbol(x, y, heading, color) {
        const size = 8;
        const rad = (heading - 90) * Math.PI / 180;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rad);
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        // Draw triangle
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(-size / 2, -size / 2);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawDataBlock(x, y, aircraft, color) {
        const offsetX = 15;
        const offsetY = -5;
        
        this.ctx.fillStyle = color;
        this.ctx.font = '11px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        // Line 1: Callsign
        this.ctx.fillText(aircraft.callsign, x + offsetX, y + offsetY);
        
        // Line 2: Altitude (in hundreds of feet)
        const altText = Math.round(aircraft.altitude / 100).toString().padStart(3, '0');
        this.ctx.fillText(altText, x + offsetX, y + offsetY + 12);
        
        // Line 3: Speed (in knots)
        const speedText = Math.round(aircraft.speed).toString();
        this.ctx.fillText(speedText, x + offsetX, y + offsetY + 24);
    }

    drawVectorLines() {
        this.ctx.setLineDash([3, 3]);
        this.ctx.lineWidth = 1;
        
        this.simulator.aircraft.forEach(aircraft => {
            const screenX = this.centerX + aircraft.x * this.scale;
            const screenY = this.centerY - aircraft.y * this.scale;
            
            // Calculate future position (5 minutes ahead)
            const minutes = 5;
            const speedNMPerMin = aircraft.speed / 60;
            const distance = speedNMPerMin * minutes;
            
            const rad = (aircraft.heading - 90) * Math.PI / 180;
            const futureX = screenX + Math.cos(rad) * distance * this.scale;
            const futureY = screenY + Math.sin(rad) * distance * this.scale;
            
            // Determine color
            let color = this.colors.aircraftNormal;
            if (aircraft.isSelected) {
                color = this.colors.aircraftSelected;
                this.ctx.lineWidth = 2;
            }
            
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(futureX, futureY);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Check if click is on an aircraft
        let clickedAircraft = null;
        let minDistance = Infinity;
        
        this.simulator.aircraft.forEach(aircraft => {
            const screenX = this.centerX + aircraft.x * this.scale;
            const screenY = this.centerY - aircraft.y * this.scale;
            
            const dx = mouseX - screenX;
            const dy = mouseY - screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20 && distance < minDistance) {
                minDistance = distance;
                clickedAircraft = aircraft;
            }
        });
        
        if (clickedAircraft) {
            this.simulator.selectAircraft(clickedAircraft.id);
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Check if hovering over an aircraft
        let hoveredAircraft = null;
        
        this.simulator.aircraft.forEach(aircraft => {
            const screenX = this.centerX + aircraft.x * this.scale;
            const screenY = this.centerY - aircraft.y * this.scale;
            
            const dx = mouseX - screenX;
            const dy = mouseY - screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {
                hoveredAircraft = aircraft;
            }
        });
        
        // Update cursor
        this.canvas.style.cursor = hoveredAircraft ? 'pointer' : 'crosshair';
    }

    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    screenToRadar(screenX, screenY) {
        return {
            x: (screenX - this.centerX) / this.scale,
            y: -(screenY - this.centerY) / this.scale
        };
    }

    radarToScreen(radarX, radarY) {
        return {
            x: this.centerX + radarX * this.scale,
            y: this.centerY - radarY * this.scale
        };
    }
}