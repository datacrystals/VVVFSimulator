import OscilloscopeDisplay from './display.js';
import AudioPlayer from './audioPlayer.js';

class TrainSimulator {
    constructor(speedDisplay, canvas, ctx) {
        this.speedDisplay = speedDisplay;
        this.canvas = canvas;
        this.ctx = ctx;
        this.trainSpeed = 0; // Start at 0 km/h
        this.soundData = [];
        this.powerLevel = 0;
        this.brakingLevel = 0;
        this.spwmConfig = [];
        this.oscilloscope = new OscilloscopeDisplay(canvas, ctx);
        this.audioPlayer = new AudioPlayer();
        this.soundWorker = new Worker(new URL('./soundWorker.js', import.meta.url));

        this.soundWorker.onmessage = (e) => {
            const { type, data } = e.data;
            if (type === 'soundData') {
                this.soundData = data;
                this.audioPlayer.updateSound(this.soundData).catch(error => {
                    console.error('Error updating sound:', error);
                });
            }
        };
    }

    async loadConfig(configPath) {
        const response = await fetch(configPath);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
        this.soundWorker.postMessage({ type: 'init', data: this.spwmConfig });
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
        this.soundWorker.postMessage({ type: 'generateSoundData', data: { speed: this.trainSpeed, canvasWidth: this.canvas.width } });
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
