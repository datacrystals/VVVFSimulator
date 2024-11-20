import OscilloscopeDisplay from './display.js';
import SoundGenerator from './generator.js';

class TrainSimulator {
    constructor(speedDisplay, canvas, ctx) {
        this.speedDisplay = speedDisplay;
        this.canvas = canvas;
        this.ctx = ctx;
        this.trainSpeed = 0;
        this.soundData = [];
        this.powerLevel = 0;
        this.brakingLevel = 0;
        this.spwmConfig = [];
        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        this.soundGenerator = null;
    }

    async loadConfig(configPath) {
        const response = await fetch(configPath);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
        this.soundGenerator = new SoundGenerator(this.spwmConfig);
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

    generateSoundData() {
        this.soundData = this.soundGenerator.generateSoundData(this.trainSpeed, this.canvas.width);
    }

    update() {
        this.updateSpeed();
        this.generateSoundData();
        this.oscilloscope.drawOscilloscope(this.soundData);
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
