// simulator.js
import OscilloscopeDisplay from './display.js';
import AudioPlayer from './audioPlayer.js';
import SoundGenerator from './generator.js';
import Speedometer from './speedometer.js';

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
        this.maxSpeed = 400; // Updated max speed

        // Audio Sample Config
        this.sampleRate = 44100; // Default sample rate
        this.bufferSize = 2048;
        this.audioPlayer = new AudioPlayer(this.sampleRate, this.bufferSize);

        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        this.startTime = performance.now(); // Initialize start time
        this.soundGeneratorForAudio = null; // Separate instance for audio
        this.soundGeneratorForOscilloscope = null; // Separate instance for oscilloscope

        // Speedometer elements
        this.speedometerCanvas = document.getElementById('speedometer');
        this.speedometer = new Speedometer(this.speedometerCanvas);

        // System time variables
        this.lastUpdateTime = performance.now();
    }

    async loadConfig(configPath) {
        // Reset params
        this.trainSpeed = 0; // Start at 0 km/h
        this.powerLevel = 0;
        this.brakingLevel = 0;

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
    }

    updateSpeed() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        if (this.powerLevel > 0) {
            const acceleration = this.powerLevel * this.maxAcceleration;
            this.trainSpeed += acceleration * deltaTime;
        } else if (this.brakingLevel > 0) {
            const deceleration = this.brakingLevel * this.maxAcceleration;
            this.trainSpeed -= deceleration * deltaTime;
        }

        // Ensure speed is within 0 to maxSpeed
        this.trainSpeed = Math.max(0, Math.min(this.trainSpeed, this.maxSpeed));
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

        // this.oscilloscope.sampleRate = this.sampleRate;
        // this.oscilloscope.clear();
        // this.oscilloscope.drawLine(soundData, "green", 0); // Output signal
        // this.oscilloscope.drawLine(commandData, "red", this.canvas.height / 3.5); // Command signal
        // this.oscilloscope.drawLine(carrierData, "blue", -this.canvas.height / 3.5); // Carrier signal

        this.oscilloscope.drawOscilloscope([
            {
                data: commandData,
                label: "Command Signal",
                yMin: -1.1,
                yMax: 1.1,
                numXTicks: 25
            },
            {
                data: soundData,
                label: "Inverter Output",
                yMin: -1.1,
                yMax: 1.1,
                numXTicks: 25
            },
            {
                data: carrierData,
                label: "Carrier Signal",
                yMin: -0.1,
                yMax: 1.1,
                numXTicks: 25
            }
        ], this.sampleRate);

        // Draw the speedometer
        this.speedometer.draw(this.trainSpeed, this.maxSpeed);

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