/**
 * Sound Effects Manager
 * "Sick" crypto sounds for interactions
 */

class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;
    private isInitialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }
    
    // Call this on the first user interaction
    public initialize() {
        if (this.isInitialized || !this.ctx) return;
        
        const resume = async () => {
            try {
                await this.ctx?.resume();
                if (this.ctx?.state === 'running') {
                    this.isInitialized = true;
                    // Remove listeners once resumed
                    document.removeEventListener('click', resume);
                    document.removeEventListener('keydown', resume);
                }
            } catch (e) {
                console.error("Failed to resume AudioContext", e);
            }
        };
        
        document.addEventListener('click', resume);
        document.addEventListener('keydown', resume);
    }

    public play(type: 'click' | 'success' | 'error' | 'hover' | 'epic') {
        if (!this.enabled || !this.ctx || !this.isInitialized) {
             // If not initialized, try to resume, but don't play sound to avoid initial errors
            if (!this.isInitialized) this.initialize();
            return;
        }
        
        // Ensure context is running before playing
        if (this.ctx.state !== 'running') return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;

            switch (type) {
                case 'click':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'success':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;
                
                case 'epic': // New sound for epic moments
                    // Ascending arpeggio
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(440, now); // A4
                    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4); // A5

                    osc.start(now);
                    osc.stop(now + 0.7);
                    break;

                case 'error':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(100, now);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;

                case 'hover':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.02, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
            }
        } catch (e) {
            console.warn("Audio playback failed", e);
        }
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

const soundManager = new SoundManager();

// Initialize the sound manager to listen for user gestures
if (typeof window !== 'undefined') {
    soundManager.initialize();
}

export const playSound = (type: 'click' | 'success' | 'error' | 'hover' | 'epic') => {
    soundManager.play(type);
}
