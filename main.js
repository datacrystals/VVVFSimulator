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

    // Initialize or resume the AudioContext after a user gesture (click or keypress)
    const initializeAudio = async () => {
        // await simulator.audioPlayer.initializeAudioContext();
        
        // Load SPWM configuration
        await simulator.loadConfig('config.json');

        simulator.update();
        // Remove the event listeners after initialization
        document.removeEventListener('click', initializeAudio);
        document.removeEventListener('keypress', initializeAudio);
    };

    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('keypress', initializeAudio, { once: true });
});
