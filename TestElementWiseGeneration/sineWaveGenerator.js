class SineWaveGenerator {
    constructor() {
        this.globalPhase = 0; // Initialize the global phase
    }

    generateSample(sampleRate, frequency) {
        const amplitude = 0.5; // Amplitude of the sine wave
        const deltaPhase = (2 * Math.PI * frequency) / sampleRate; // Phase increment per sample
        const sample = amplitude * Math.sin(this.globalPhase);
        this.globalPhase += deltaPhase;

        // Ensure the phase stays within the range [0, 2*PI)
        if (this.globalPhase >= 2 * Math.PI) {
            this.globalPhase -= 2 * Math.PI;
        }

        return sample;
    }
}
