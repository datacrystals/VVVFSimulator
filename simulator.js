import OscilloscopeDisplay from './display.js';
import AudioPlayer from './audioPlayer.js';
import SoundGenerator from './generator.js';

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
        this.audioPlayer.maxQueueSize = 3;

        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        this.startTime = performance.now(); // Initialize start time
        this.soundGeneratorForAudio = null; // Separate instance for audio
        this.soundGeneratorForOscilloscope = null; // Separate instance for oscilloscope
    }

    async loadConfig(configPath) {
        const response = await fetch(configPath);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
        this.soundGeneratorForAudio = new SoundGenerator(this.spwmConfig);
        this.soundGeneratorForOscilloscope = new SoundGenerator(this.spwmConfig);

        // Setup Audio Stuff, Get Config
        await this.audioPlayer.initializeAudioContext();
        this.sampleRate = this.audioPlayer.getSampleRate(); // Correctly call getSampleRate

        // Set the sound generator function for audio
        this.audioPlayer.setSoundGenerator((bufferSize, sampleRate) => {
            const soundData = new Float32Array(bufferSize);
            const commandData = new Float32Array(bufferSize);

            for (let i = 0; i < bufferSize; i++) {
                const sample = this.soundGeneratorForAudio.generateSample(this.trainSpeed, sampleRate);
                soundData[i] = sample.soundSample;
                commandData[i] = sample.commandSample;
            }

            return soundData;
        });
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

        let soundData = new Float32Array(this.canvas.width);
        let commandData = new Float32Array(this.canvas.width);

        for (let i = 0; i < this.bufferSize; i++) {
            const sample = this.soundGeneratorForOscilloscope.generateSample(this.trainSpeed, this.sampleRate);
            soundData[i] = sample.soundSample;
            commandData[i] = sample.commandSample;
        }
        this.soundGeneratorForOscilloscope.globalPhases = [0,0]; // reset every frame to keep the oscope generation static

        this.oscilloscope.sampleRate = this.sampleRate;
        this.oscilloscope.clear();
        this.oscilloscope.drawLine(soundData, "green");
        this.oscilloscope.drawLine(commandData, "red");

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