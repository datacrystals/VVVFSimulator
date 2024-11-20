class TrainSimulator {
    constructor(speedDisplay, canvas, ctx) {
        this.speedDisplay = speedDisplay;
        this.canvas = canvas;
        this.ctx = ctx;
        this.trainSpeed = 0;
        this.soundData = [];
        this.powerLevel = 0;
        this.brakingLevel = 0;
        this.toneRanges = [];
        this.spwmMode = 'fixed'; // 'fixed' or 'ramp'
        this.carrierFrequency = 1000; // Carrier frequency in Hz
        this.commandFrequency = 50; // Command frequency in Hz
    }

    setToneRanges(ranges) {
        this.toneRanges = ranges;
    }

    setSPWMMode(mode) {
        this.spwmMode = mode;
    }

    setCarrierFrequency(frequency) {
        this.carrierFrequency = frequency;
    }

    setCommandFrequency(frequency) {
        this.commandFrequency = frequency;
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
        let tone = this.getToneForSpeed(this.trainSpeed);
        for (let i = 0; i < this.canvas.width; i++) {
            this.soundData.push(this.spwm(i, tone));
        }
    }

    getToneForSpeed(speed) {
        for (const range of this.toneRanges) {
            if (speed >= range.minSpeed && speed < range.maxSpeed) {
                if (range.type === 'tone') {
                    return range.tone;
                } else if (range.type === 'rampTone') {
                    const ratio = (speed - range.minSpeed) / (range.maxSpeed - range.minSpeed);
                    return range.minTone + (range.maxTone - range.minTone) * ratio;
                }
            }
        }
        return 0; // Default tone if no range matches
    }

    spwm(i, tone) {
        const carrierAmplitude = 1;
        const commandAmplitude = 1;
        let carrierFrequency = this.carrierFrequency;

        if (this.spwmMode === 'ramp') {
            carrierFrequency = tone * 2; // Synchronous mode
        }

        const carrier = (i * 0.10 * carrierFrequency / 1000) % 1; // Sawtooth wave
        const command = Math.sin(i * 0.01 * tone / 1000 * 2 * Math.PI);

        let output;
        if (command > carrier) {
            output = commandAmplitude;
        } else if (command < 0 && command < carrier) {
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
        const gridSize = 50; // Size of each grid square

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

        // Draw x-axis labels
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let x = 0; x <= width; x += gridSize) {
            ctx.fillText((x / gridSize).toString(), x, height - 10);
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
            this.ctx.lineTo(i, this.canvas.height / 2 + this.soundData[i]);
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
