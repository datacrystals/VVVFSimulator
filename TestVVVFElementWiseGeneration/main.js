document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const generator = new SoundGenerator();

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

    // Function to encode audio data as WAV
    function encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        // FMT sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Sub-chunk size
        view.setUint16(20, 1, true); // Audio format (1 for PCM)
        view.setUint16(22, 1, true); // Number of channels
        view.setUint32(24, sampleRate, true); // Sample rate
        view.setUint32(28, sampleRate * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        // Data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Write the PCM samples
        const l = samples.length;
        for (let i = 0; i < l; i++) {
            view.setInt16(44 + i * 2, samples[i] < 1 ? samples[i] * 0x7FFF : 0x7FFF, true);
        }

        return buffer;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function generateAudioBuffer() {
        const startSpeed = 0; // Starting speed in km/h
        const endSpeed = 200; // Ending speed in km/h
        const totalDuration = 30; // Total duration in seconds
        const totalSamples = totalDuration * sampleRate;
        const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const commandData = new Float32Array(totalSamples);

        // Create a low-pass filter with a cutoff frequency
        const cutoffFrequency = 1200; // Cutoff frequency in Hz
        const lowPassFilter = new LowPassFilter(cutoffFrequency, sampleRate);

        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate; // Current time in seconds
            const normalizedTime = (t / totalDuration) * 10 - 5; // Scale and shift time for sigmoid input
            const sigmoidValue = 1 / (1 + Math.exp(-normalizedTime)); // Sigmoid function
            const speed = startSpeed + (endSpeed - startSpeed) * sigmoidValue; // Interpolate speed
            const { soundSample, commandSample } = generator.generateSample(speed, sampleRate);

            // Apply low-pass filter to the sound sample
            const filteredSoundSample = lowPassFilter.process(soundSample);

            channelData[i] = filteredSoundSample; // or just `soundSample` for unfiltered
            commandData[i] = commandSample;
        }

        return audioBuffer;
    }

    playButton.addEventListener('click', () => {
        const audioBuffer = generateAudioBuffer();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    });

    downloadButton.addEventListener('click', () => {
        const audioBuffer = generateAudioBuffer();
        const channelData = audioBuffer.getChannelData(0);
        const wavBuffer = encodeWAV(channelData, sampleRate);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'audio.wav';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });
});
