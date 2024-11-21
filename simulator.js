import OscilloscopeDisplay from './display.js';
import AudioPlayer from './audioPlayer.js';
import SoundGenerator from './generator.js';

function shrinkArray(array, targetSize) {
    if (array.length <= targetSize) {
        return array; // No need to shrink if the array is already at or below the target size
    }

    let currentSize = array.length;
    let n = Math.ceil(currentSize / targetSize);

    let result = new Float32Array(targetSize);
    let resultIndex = 0;

    for (let i = 0; i < currentSize; i += n) {
        if (resultIndex < targetSize) {
            result[resultIndex] = array[i];
            resultIndex++;
        }
    }

    return result;
}

class TrainSimulator {
    constructor(speedDisplay, canvas, ctx) {
        this.speedDisplay = speedDisplay;
        this.canvas = canvas;
        this.ctx = ctx;
        this.trainSpeed = 0; // Start at 0 km/h
        this.powerLevel = 0;
        this.brakingLevel = 0;
        this.spwmConfig = [];
        

        // Audio Sample Config
        this.sampleRate = -1; // automatically set by the system when the audio context is initialized
        this.bufferSize = 1024;
        this.audioPlayer = new AudioPlayer();
        this.audioPlayer.bufferSize = this.bufferSize;
        this.audioPlayer.maxQueueSize = 1;

        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        // this.soundWorker = new Worker(new URL('./soundWorker.js', import.meta.url));
        this.startTime = performance.now(); // Initialize start time
        this.soundGenerator = null;



        // this.soundWorker.onmessage = (e) => {
        //     const { type, data } = e.data;
        //     if (type === 'soundData') {
        //         this.soundData = data;
        //         this.audioPlayer.updateSound(this.soundData).catch(error => {
        //             console.error('Error updating sound:', error);
        //         });
        //     }
        // };
    }

    async loadConfig(configPath) {
        const response = await fetch(configPath);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
        // this.soundWorker.postMessage({ type: 'init', data: this.spwmConfig });
        this.soundGenerator = new SoundGenerator(this.spwmConfig)


        // Setup Audio Stuff, Get Config
        this.audioPlayer.initializeAudioContext();
        this.sampleRate = this.audioPlayer.getSampleRate();
    }

    updateSpeed() {
        if (this.powerLevel > 0) {
            this.trainSpeed += this.powerLevel * 0.1;
        } else if (this.brakingLevel > 0) {
            this.trainSpeed -= this.brakingLevel * 0.1;
        }
        this.trainSpeed = Math.max(0, Math.min(this.trainSpeed, 200)); // Ensure speed is within 0 to 200 km/h
        this.speedDisplay.textContent = this.trainSpeed.toFixed(1);
    }


    update() {
        this.updateSpeed();
        // this.generateSoundData();
        let soundData = new Float32Array(this.bufferSize);
        let commandData = new Float32Array(this.bufferSize);
        const globalTime = (performance.now() - this.startTime) / 1000; // Calculate global time in seconds
        this.soundGenerator.generateSoundData(this.trainSpeed, soundData, commandData, globalTime, this.sampleRate);
        
        this.audioPlayer.updateSound(soundData);

        this.oscilloscope.sampleRate = this.sampleRate;
        this.oscilloscope.clear();
        this.oscilloscope.drawLine(shrinkArray(soundData, this.canvas.width), "green");
        this.oscilloscope.drawLine(shrinkArray(commandData, this.canvas.width), "red");

        requestAnimationFrame(() => this.update());
    }

    setPower(level) {
        this.powerLevel = level;
        this.brakingLevel = 0;
    }

    setNeutral() {
        this.powerLevel = 0;
        this.brakingLevel = 0;
    }

    setBraking(level) {
        this.brakingLevel = level;
        this.powerLevel = 0;
    }
}

export default TrainSimulator;
