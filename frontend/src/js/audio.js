/**
 * AUDIO MANAGER MODULE
 * Handles sound effects and audio feedback
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isMuted = false;
        this.volume = 0.5;
    }

    async initialize() {
        try {
            // Create Audio Context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate sound effects procedurally
            this.generateSounds();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    generateSounds() {
        // We'll generate simple beep sounds procedurally
        // This avoids needing external audio files
        
        this.sounds.set('radar_sweep', {
            frequency: 880,
            duration: 0.05,
            type: 'sine',
            volume: 0.1
        });
        
        this.sounds.set('command', {
            frequency: 1200,
            duration: 0.1,
            type: 'square',
            volume: 0.3
        });
        
        this.sounds.set('conflict', {
            frequency: 440,
            duration: 0.3,
            type: 'sawtooth',
            volume: 0.5
        });
        
        this.sounds.set('alert', {
            frequency: 880,
            duration: 0.2,
            type: 'triangle',
            volume: 0.4
        });
        
        this.sounds.set('success', {
            frequency: 1760,
            duration: 0.15,
            type: 'sine',
            volume: 0.3
        });
    }

    playSound(soundName) {
        if (this.isMuted || !this.audioContext) return;
        
        const sound = this.sounds.get(soundName);
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(sound.volume * this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }

    playAlert(alertType) {
        if (this.isMuted || !this.audioContext) return;
        
        try {
            // Different alert patterns based on type
            switch (alertType) {
                case 'conflict':
                    this.playAlertPattern([440, 880], 0.2, 3);
                    break;
                case 'warning':
                    this.playAlertPattern([660], 0.3, 2);
                    break;
                case 'info':
                    this.playSound('alert');
                    break;
                default:
                    this.playSound('alert');
            }
        } catch (error) {
            console.error('Failed to play alert:', error);
        }
    }

    playAlertPattern(frequencies, duration, repeats) {
        let delay = 0;
        
        for (let i = 0; i < repeats; i++) {
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, duration, 0.4);
                }, delay);
                delay += duration * 1000 + 100;
            });
        }
    }

    playTone(frequency, duration, volume) {
        if (this.isMuted || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.error('Failed to play tone:', error);
        }
    }

    playRadarSweep() {
        if (this.isMuted || !this.audioContext) return;
        this.playSound('radar_sweep');
    }

    playCommandConfirm() {
        this.playSound('command');
    }

    playSuccess() {
        this.playSound('success');
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    mute() {
        this.isMuted = true;
    }

    unmute() {
        this.isMuted = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}