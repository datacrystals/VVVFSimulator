importScripts('generator.js');

let soundGenerator = null;
let spwmConfig = null;

onmessage = function(e) {
    const { type, data } = e.data;
    if (type === 'init') {
        spwmConfig = data;
        soundGenerator = new SoundGenerator(spwmConfig);
    } else if (type === 'generateSoundData') {
        const { speed, canvasWidth } = data;
        const soundData = soundGenerator.generateSoundData(speed, canvasWidth);
        postMessage({ type: 'soundData', data: soundData });
    }
};
