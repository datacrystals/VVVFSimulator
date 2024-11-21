document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const generator = new SineWaveGenerator();

    playButton.addEventListener('click', () => {
        const startFrequency = 440; // Starting frequency in Hz
        const endFrequency = 880; // Ending frequency in Hz
        const totalDuration = 3; // Total duration in seconds
        const totalSamples = totalDuration * sampleRate;
        const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate; // Current time in seconds
            const frequency = startFrequency + (endFrequency - startFrequency) * (t / totalDuration); // Linear interpolation
            channelData[i] = generator.generateSample(sampleRate, frequency);
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    });
});
