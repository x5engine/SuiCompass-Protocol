/**
 * Sound Effects Manager
 * "Sick" crypto sounds for interactions
 */

class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    private async resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    public play(type: 'click' | 'success' | 'error' | 'hover') {
        if (!this.enabled || !this.ctx) return;

        // Try to resume context on every user interaction (e.g. click)
        this.resumeContext().catch(() => {});

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
                    // Arcade coin sound
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
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
                    // Subtle high tick
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.02, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
            }
        } catch (e) {
            // Ignore audio context errors
            console.warn("Audio playback failed", e);
        }
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

const soundManager = new SoundManager();

export const playSound = (type: 'click' | 'success' | 'error' | 'hover') => {
    soundManager.play(type);
}