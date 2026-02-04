/**
 * Sound Effects Manager
 * "Sick" crypto sounds for interactions
 */

export const playSound = (type: 'click' | 'success' | 'error' | 'hover') => {
    // In a real app, we'd load files. For now, we use simple oscillators or placeholders
    // that don't error if blocked.
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

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
    }
}
