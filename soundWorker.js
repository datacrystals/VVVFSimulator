importScripts('generator.js');

let soundGenerator = null;
let spwmConfig = null;

onmessage = function(e) {
    const { type, data } = e.data;
    if (type === 'init') {
        spwmConfig = data;
        soundGenerator = new SoundGenerator(spwmConfig);
    } else if (type === 'generateSoundData') {
        const { speed, canvasWidth, globalTime, sampleRate } = data;
        const soundData = soundGenerator.generateSoundData(speed, canvasWidth, globalTime, sampleRate);
        postMessage({ type: 'soundData', data: soundData });
    }
};
