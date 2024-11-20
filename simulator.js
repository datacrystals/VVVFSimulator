import OscilloscopeDisplay from './display.js';

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
    }

    async loadConfig(configPath) {
        const response = await fetch(configPath);
        const config = await response.json();
        this.spwmConfig = config.speedRanges;
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
        this.soundData = [];
        let commandFrequency = this.getCommandFrequencyForSpeed(this.trainSpeed);
        const spwmSettings = this.getSPWMSettingsForSpeed(this.trainSpeed);
        for (let i = 0; i < this.canvas.width; i++) {
            this.soundData.push(this.spwm(i, commandFrequency, spwmSettings));
        }
    }

    getCommandFrequencyForSpeed(speed) {
        // Define the command frequency based on the train speed
        // For example, a linear ramp from 10 Hz at 0 km/h to 100 Hz at 200 km/h
        return 10 + (speed / 200) * 90;
    }

    getSPWMSettingsForSpeed(speed) {
        for (const range of this.spwmConfig) {
            if (speed >= range.minSpeed && speed < range.maxSpeed) {
                return range;
            }
        }
        return null; // Default settings if no range matches
    }

    spwm(i, commandFrequency, spwmSettings) {
        const carrierAmplitude = 1;
        const commandAmplitude = 1;
        let carrierFrequency;

        if (spwmSettings.spwm.type === 'fixed') {
            carrierFrequency = spwmSettings.spwm.carrierFrequency;
        } else if (spwmSettings.spwm.type === 'ramp') {
            const ratio = (this.trainSpeed - spwmSettings.minSpeed) / (spwmSettings.maxSpeed - spwmSettings.minSpeed);
            carrierFrequency = spwmSettings.spwm.minCarrierFrequency + (spwmSettings.spwm.maxCarrierFrequency - spwmSettings.spwm.minCarrierFrequency) * ratio;
        }

        const carrier = (i * 0.05 * carrierFrequency / 1000) % 1; // Sawtooth wave
        const command = Math.sin(i * 0.01 * commandFrequency / 1000 * 2 * Math.PI);

        let output;
        if (command > 0 && command > carrier) {
            output = commandAmplitude;
        } else if (command < 0 && command < -carrier) {
            output = -commandAmplitude;
        } else {
            output = 0;
        }

        return output * 100;
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
