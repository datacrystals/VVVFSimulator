import TrainSimulator from './simulator.js';
import TrainControls from './controls.js';

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
        configName.textContent = `Name: ${config.name}`;
        configManufacturer.textContent = `Manufacturer: ${config.manufacturer}`;
        configDate.textContent = `Date: ${config.date}`;
        configDescription.textContent = `Description: ${config.description}`;
        configMaxAcceleration.textContent = `Max Acceleration: ${config.maxAcceleration_kmh_s} km/h/s`;
        configMaxSpeed.textContent = `Max Speed: ${config.maxSpeed_kmh} km/h`;
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
});