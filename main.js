// main.js
import TrainSimulator from './simulator.js';
import TrainControls from './controls.js';
import VerticalLinearBar from './VerticalLinearBar.js';

document.addEventListener('DOMContentLoaded', async () => {
    const speedDisplay = document.getElementById('speed');
    const canvas = document.getElementById('oscilloscope');
    const ctx = canvas.getContext('2d');

    const simulator = new TrainSimulator(speedDisplay, canvas, ctx);

    const buttons = {
        p3: document.getElementById('p3'),
        p2: document.getElementById('p2'),
        p1: document.getElementById('p1'),
        n: document.getElementById('n'),
        b1: document.getElementById('b1'),
        b2: document.getElementById('b2'),
        b3: document.getElementById('b3'),
        b4: document.getElementById('b4'),
        b5: document.getElementById('b5')
    };

    const controls = new TrainControls(buttons, simulator);

    window.setPower = function(level) {
        controls.setPower(level);
    };

    window.setNeutral = function() {
        controls.setNeutral();
    };

    window.setBraking = function(level) {
        controls.setBraking(level);
    };

    controls.setNeutral();

    // Volume Slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value;
        if (simulator.audioPlayer.gainNode) { // Check if gainNode is defined
            simulator.audioPlayer.gainNode.gain.value = volume;
        }
    });

    // Configuration Dropdown
    const configDropdown = document.getElementById('configDropdown');
    const configName = document.getElementById('configName');
    const configManufacturer = document.getElementById('configManufacturer');
    const configDate = document.getElementById('configDate');
    const configDescription = document.getElementById('configDescription');
    const configMaxAcceleration = document.getElementById('configMaxAcceleration');
    const configMaxSpeed = document.getElementById('configMaxSpeed');
    const manufacturerLogo = document.getElementById('manufacturerLogo');

    async function loadConfigurations() {
        const response = await fetch('Configurations/Manifest.json');
        const manifest = await response.json();

        manifest.configs.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            configDropdown.appendChild(option);
        });

        configDropdown.value = manifest.defaultConfig; // Set the default config as selected

        configDropdown.addEventListener('change', async () => {
            const selectedConfig = configDropdown.value;
            const configPath = `Configurations/${selectedConfig}`;
            const config = await fetchConfig(configPath);
            displayConfigStats(config);
            await simulator.loadConfig(configPath);
        });

        // Load the default configuration
        const defaultConfigPath = `Configurations/${manifest.defaultConfig}`;
        const config = await fetchConfig(defaultConfigPath);
        displayConfigStats(config);
        await simulator.loadConfig(defaultConfigPath);
    }

    async function fetchConfig(configPath) {
        const response = await fetch(configPath);
        return await response.json();
    }

    function displayConfigStats(config) {
        configName.textContent = config.name;
        configManufacturer.textContent = config.manufacturer;
        configDate.textContent = config.date;
        configDescription.textContent = config.description;
        configMaxAcceleration.textContent = `${config.maxAcceleration_kmh_s} km/h/s`;
        configMaxSpeed.textContent = `${config.maxSpeed_kmh} km/h`;

        // Load manufacturer logo
        manufacturerLogo.src = `/Assets/Logos/${config.manufacturer.toLowerCase()}.png`;
        manufacturerLogo.alt = `${config.manufacturer} Logo`;
    }

    // Load configurations immediately on page load
    loadConfigurations();

    // Initialize or resume the AudioContext after a user gesture (click or keypress)
    const initializeAudio = async () => {
        simulator.update();
        simulator.playAudio();
        // Remove the event listeners after initialization
        document.removeEventListener('click', initializeAudio);
        document.removeEventListener('keypress', initializeAudio);
    };

    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('keypress', initializeAudio, { once: true });

    // Speedometer and Tractive Effort
    const speedometerCanvas = document.getElementById('speedometer');
    const tractiveEffortCanvas = document.getElementById('tractiveEffort');

    const speedometerOptions = {
        verticalOffset: 75,
        width: speedometerCanvas.width / 2.5,
        height: speedometerCanvas.height - 75,
        marginTop: 20,
        maxValue: 400, // Example max speed in km/h
        graduationStep: 25,
        unit: 'km/h',
        color: '#22aaff',
        centered: false,
        positiveOnly: true
    };

    const tractiveEffortOptions = {
        verticalOffset: 75,
        width: tractiveEffortCanvas.width / 2.5,
        height: tractiveEffortCanvas.height - 75,
        marginTop: 20,
        maxValue: 100, // Example max tractive effort in kN
        graduationStep: 25,
        unit: 'kN',
        color: '#22aaff',
        centered: true,
        positiveOnly: false
    };

    const speedometer = new VerticalLinearBar(speedometerCanvas, speedometerOptions);
    const tractiveEffortBar = new VerticalLinearBar(tractiveEffortCanvas, tractiveEffortOptions);

    simulator.speedometer = speedometer;
    simulator.tractiveEffortBar = tractiveEffortBar;

    // Example tractive effort value (this should be updated dynamically based on the train's state)
    let tractiveEffort = 0;
    const maxTractiveEffort = 100; // Example max tractive effort in kN

    // Update the speedometer and tractive effort bar
    simulator.update = function() {
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

        // Draw the speedometer and tractive effort bar
        this.speedometer.draw(this.trainSpeed);
        this.tractiveEffortBar.draw(this.calculateTractiveEffort());

        requestAnimationFrame(() => this.update());
    };

    simulator.calculateTractiveEffort = function() {
        // Example calculation for tractive effort
        // This should be replaced with the actual logic to calculate tractive effort based on train's state
        return this.trainSpeed * 0.5; // Placeholder calculation
    };
});