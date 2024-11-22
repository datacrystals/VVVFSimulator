// simulator.js
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
        this.speedometerCtx = this.speedometerCanvas.getContext('2d');
        // this.speedometerDigital = document.getElementById('speedometer-digital');

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
        // this.speedometerDigital.textContent = this.trainSpeed.toFixed(1);
    }

    drawSpeedometer() {
        const speedometerVerticalOffset = 75;
        const speedometerWidth = this.speedometerCanvas.width / 2.5; // Width of the speedometer spans the entire canvas width
        const speedometerHeight = this.speedometerCanvas.height - speedometerVerticalOffset; // Height of the speedometer
        const marginTop = 20; // Margin at the top to prevent text cutoff
    
        // Clear the speedometer canvas
        this.speedometerCtx.clearRect(0, 0, this.speedometerCanvas.width, this.speedometerCanvas.height);
    
        // Draw the background of the speedometer
        this.speedometerCtx.fillStyle = '#1a1a1a';
        this.speedometerCtx.fillRect(0, marginTop, speedometerWidth, speedometerHeight - marginTop);
    
        // Draw the speedometer bar
        const barHeight = (this.trainSpeed / this.maxSpeed) * (speedometerHeight - marginTop);
        this.speedometerCtx.fillStyle = '#22aaff'; // Blue color for the bar
        this.speedometerCtx.fillRect(0, speedometerHeight - barHeight, speedometerWidth, barHeight);
    
        // Draw the graduations
        const graduationStep = 25; // 25 km/h per graduation
        this.speedometerCtx.strokeStyle = '#ffffff';
        this.speedometerCtx.lineWidth = 1;
        for (let speed = 0; speed <= this.maxSpeed; speed += graduationStep) {
            const y = speedometerHeight - (speed / this.maxSpeed) * (speedometerHeight - marginTop);
            this.speedometerCtx.beginPath();
            this.speedometerCtx.moveTo(0, y);
            this.speedometerCtx.lineTo(speedometerWidth, y);
            this.speedometerCtx.stroke();
    
            // Draw the speed label
            this.speedometerCtx.fillStyle = '#ffffff';
            this.speedometerCtx.font = '14px Arial'; // Smaller font size
            this.speedometerCtx.fillText(speed, speedometerWidth + 5, y + 5);
    
            // Draw the units label
            this.speedometerCtx.fillStyle = '#ffffff';
            this.speedometerCtx.font = '12px Arial'; // Smaller font size
            this.speedometerCtx.fillText('km/h', speedometerWidth + 5, y + 18);
        }
    
        // Draw the rounded, centered speed display at the bottom
        const speedText = this.trainSpeed.toFixed(1).padStart(5, '0'); // Format speed to 3 digits plus decimal
        const textWidth = this.speedometerCtx.measureText(speedText).width;
        const textHeight = 20; // Adjust based on font size
        const boxPadding = 3;
        const boxWidth = this.speedometerCanvas.width - 4;
        const boxHeight = textHeight*2 + 2 * boxPadding;
        const boxX = 2;
        const boxY = this.speedometerCanvas.height - boxHeight - 2; // Position at the bottom with some margin
    
        // Draw the white border around the speed number
        this.speedometerCtx.strokeStyle = '#ffffff';
        this.speedometerCtx.lineWidth = 1;
        this.speedometerCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
        // Draw the speed number inside the box
        this.speedometerCtx.fillStyle = '#00ff00';
        this.speedometerCtx.font = '16px Arial';
        this.speedometerCtx.fillText(speedText, (this.speedometerCanvas.width - textWidth) / 2 - boxPadding - 3,  boxY + boxHeight - boxPadding - textHeight);
        this.speedometerCtx.fillStyle = '#ffff00';
        this.speedometerCtx.fillText("km/h", (this.speedometerCanvas.width - textWidth) / 2 - boxPadding, boxY + boxHeight - boxPadding * 3);
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

        // Draw the speedometer
        this.drawSpeedometer();

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