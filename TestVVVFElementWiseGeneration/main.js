document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const generator = new SoundGenerator([
        { minSpeed: 0, maxSpeed: 100, spwm: { type: 'ramp', minCarrierFrequency: 100, maxCarrierFrequency: 200 } },
        { minSpeed: 100, maxSpeed: 200, spwm: { type: 'fixed', carrierFrequency: 300 } }
    ]);

    // Simple low-pass filter
    class LowPassFilter {
        constructor(cutoffFrequency, sampleRate) {
            this.cutoffFrequency = cutoffFrequency;
            this.sampleRate = sampleRate;
            this.alpha = 2 * Math.PI * cutoffFrequency / sampleRate;
            this.y1 = 0;
        }

        process(input) {
            const coeff = this.alpha / (1 + this.alpha);
            this.y1 = coeff * input + (1 - coeff) * this.y1;
            return this.y1;
        }
    }

    playButton.addEventListener('click', () => {
        const startSpeed = 0; // Starting speed in km/h
        const endSpeed = 200; // Ending speed in km/h
        const totalDuration = 30; // Total duration in seconds
        const totalSamples = totalDuration * sampleRate;
        const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const commandData = new Float32Array(totalSamples);

        // Create a low-pass filter with a cutoff frequency
        const cutoffFrequency = 500; // Cutoff frequency in Hz
        const lowPassFilter = new LowPassFilter(cutoffFrequency, sampleRate);

        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate; // Current time in seconds
            const normalizedTime = (t / totalDuration) * 10 - 5; // Scale and shift time for sigmoid input
            const sigmoidValue = 1 / (1 + Math.exp(-normalizedTime)); // Sigmoid function
            const speed = startSpeed + (endSpeed - startSpeed) * sigmoidValue; // Interpolate speed
            const { soundSample, commandSample } = generator.generateSample(speed, sampleRate);

            // Apply low-pass filter to the sound sample
            const filteredSoundSample = lowPassFilter.process(soundSample);

            channelData[i] = filteredSoundSample;
            commandData[i] = commandSample;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    });
});
