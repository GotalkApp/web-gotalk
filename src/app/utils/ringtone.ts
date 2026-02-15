export class RingtoneManager {
    private audioContext: AudioContext | null = null;
    private oscillators: OscillatorNode[] = [];
    private gainNodes: GainNode[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private isPlaying: boolean = false;

    constructor() {
        // Initialize AudioContext lazily
        const win = typeof window !== 'undefined' ? window : null;
        if (win) {
            const AudioContextClass = win.AudioContext || (win as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        }
    }

    playIncoming() {
        this.stop(); // Stop any current sound
        if (!this.audioContext) return;
        this.isPlaying = true;

        const playNote = () => {
            if (!this.isPlaying || !this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Create oscillator for a "digital phone" sound
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc1.frequency.value = 440; // A4
            osc2.frequency.value = 587.33; // D5 (harmony)

            osc1.type = 'sine';
            osc2.type = 'sine';

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.audioContext.destination);

            // Envelope
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 2); // 2 seconds fade out

            osc1.start(now);
            osc2.start(now);

            osc1.stop(now + 2);
            osc2.stop(now + 2);

            // Keep references to stop immediately if needed (though these stop automatically)
            // Mostly we need to stop the loop
        };

        playNote();
        this.intervalId = setInterval(playNote, 3000); // Repeat every 3s
    }

    playCalling() {
        this.stop();
        if (!this.audioContext) return;
        this.isPlaying = true;

        const playTone = () => {
            if (!this.isPlaying || !this.audioContext) return;
            const now = this.audioContext.currentTime;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.frequency.value = 425; // Standard ringback tone freq (approx)
            osc.type = 'sine';

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + 1.5);
            gain.gain.linearRampToValueAtTime(0, now + 1.6);

            osc.start(now);
            osc.stop(now + 1.6);
        };

        playTone();
        this.intervalId = setInterval(playTone, 4000); // USA ringback pattern is 2s on 4s off usually, simplified here
    }

    stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Clean up active nodes if I tracked them perfectly, but mainly stopping the interval is enough for discrete notes
        // For continuous sounds, we'd call stop() on oscillators.

        // Close audio context? No, keep it open for reuse, usually.
        // Or at least suspend?
    }
}

export const ringtoneManager = new RingtoneManager();
