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
        this.maxAcceleration = 2; // Default max acceleration
        this.maxSpeed = 200; // Default max speed

        // Audio Sample Config
        this.sampleRate = 44100; // Default sample rate
        this.bufferSize = 2048;
        this.audioPlayer = new AudioPlayer(this.sampleRate, this.bufferSize);

        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        this.startTime = performance.now(); // Initialize start time
        this.soundGeneratorForAudio = null; // Separate instance for audio
        this.soundGeneratorForOscilloscope = null; // Separate instance for oscilloscope
    }

    async loadConfig(configPath) {
        // Add a cache-busting query parameter
        const cacheBust = `?t=${new Date().getTime()}`;
        const response = await fetch(configPath + cacheBust);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
        this.maxAcceleration = parseFloat(config.maxAcceleration_kmh_s);
        this.maxSpeed = config.maxSpeed_kmh;
        this.soundGeneratorForAudio = new SoundGenerator(this.spwmConfig);
        this.soundGeneratorForOscilloscope = new SoundGenerator(this.spwmConfig);

        // Set the sound generator for audio
        this.audioPlayer.setGenerator({
            generateSample: () => {
                return this.soundGeneratorForAudio.generateSample(this.trainSpeed, this.sampleRate).soundSample;
            }
        });
        this.playAudio();
    }

    updateSpeed() {
        if (this.powerLevel > 0) {
            this.trainSpeed += this.powerLevel * this.maxAcceleration * 0.1;
        } else if (this.brakingLevel > 0) {
            this.trainSpeed -= this.brakingLevel * this.maxAcceleration * 0.1;
        }
        this.trainSpeed = Math.max(0, Math.min(this.trainSpeed, this.maxSpeed)); // Ensure speed is within 0 to maxSpeed
        this.speedDisplay.textContent = this.trainSpeed.toFixed(1);
    }

    update() {
        this.updateSpeed();

        const bufferSize = this.oscilloscope.getWidth();
        let soundData = new Float32Array(bufferSize);
        let commandData = new Float32Array(bufferSize);
        let carrierData = new Float32Array(bufferSize);

        for (let i = 0; i < bufferSize; i++) {
            const sample = this.soundGeneratorForOscilloscope.generateSample(this.trainSpeed, this.sampleRate);
            soundData[i] = sample.soundSample;
            commandData[i] = sample.commandSample;
            carrierData[i] = sample.carrierSample;
        }
        this.soundGeneratorForOscilloscope.globalPhases = [0, 0]; // reset every frame to keep the oscope generation static

        this.oscilloscope.sampleRate = this.sampleRate;
        this.oscilloscope.clear();
        this.oscilloscope.drawLine(soundData, "green", 0); // Output signal
        this.oscilloscope.drawLine(commandData, "red", this.canvas.height / 3.5); // Command signal
        this.oscilloscope.drawLine(carrierData, "blue", -this.canvas.height / 3.5); // Carrier signal

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

    playAudio() {
        this.audioPlayer.play();
    }
}

export default TrainSimulator;