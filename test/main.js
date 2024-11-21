document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const bufferSize = 1024;
    const generator = new SoundGenerator();

    playButton.addEventListener('click', () => {
        const frequencies = [440, 440, 440]; // Example frequencies in Hz
        const totalDuration = 30; // Total duration in seconds
        const totalSamples = totalDuration * sampleRate;
        const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        let offset = 0;
        let speed = 5;
        while (offset < totalSamples) {
            const remainingSamples = totalSamples - offset;
            const currentBufferSize = Math.min(bufferSize, remainingSamples);
            const soundData = new Float32Array(currentBufferSize);
            const commandData = new Float32Array(currentBufferSize);
            const frequency = frequencies[(offset / bufferSize) % frequencies.length]; // Cycle through frequencies
            console.log(speed);
            generator.generateSoundData(speed, soundData, commandData, sampleRate);
            speed += 0.1;
            speed = Math.min(speed, 200);
            channelData.set(soundData, offset);
            offset += currentBufferSize;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    });
});
