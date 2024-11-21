// importScripts('generator.js');

// let soundGenerator = null;
// let spwmConfig = null;

// onmessage = function(e) {
//     const { type, data } = e.data;
//     if (type === 'init') {
//         spwmConfig = data;
//         soundGenerator = new SoundGenerator(spwmConfig);
//     } else if (type === 'generateSoundData') {
//         const { speed, canvasWidth, globalTime, sampleRate } = data;
//         soundData = new Float32Array(canvasWidth);
//         commandData = new Float32Array(canvasWidth);
//         soundGenerator.generateSoundData(speed, soundData, commandData, globalTime, sampleRate);
//         postMessage({ type: 'soundData', soundData, commandData });
//     }
// };
