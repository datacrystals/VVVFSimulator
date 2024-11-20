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

    drawGrid() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const gridSize = 100; // Size of each grid square
        const timeInterval = 100; // Time interval in microseconds

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw x-axis labels in microseconds
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let x = 0; x <= width; x += gridSize) {
            const time = (x / width) * (width / gridSize) * timeInterval;
            ctx.fillText(time.toFixed(0) + ' µs', x, height - 10);
        }

        // Draw y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = 0; y <= height; y += gridSize) {
            ctx.fillText((height / 2 - y).toString(), width - 10, y);
        }
    }

    drawOscilloscope() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        for (let i = 0; i < this.soundData.length; i++) {
            this.ctx.lineTo(i, this.canvas.height / 2 - this.soundData[i]);
        }
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.stroke();
    }

    update() {
        this.updateSpeed();
        this.generateSoundData();
        this.drawOscilloscope();
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
