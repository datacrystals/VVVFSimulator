import TrainSimulator from './simulator.js';
import TrainControls from './controls.js';

document.addEventListener('DOMContentLoaded', () => {
    const speedDisplay = document.getElementById('speed');
    const canvas = document.getElementById('oscilloscope');
    const ctx = canvas.getContext('2d');

    const simulator = new TrainSimulator(speedDisplay, canvas, ctx);

    // Define tone ranges
    const toneRanges = [
        { minSpeed: 0, maxSpeed: 5, type: 'tone', tone: 300 },
        { minSpeed: 5, maxSpeed: 10, type: 'tone', tone: 500 },
        { minSpeed: 10, maxSpeed: 50, type: 'rampTone', minTone: 500, maxTone: 900 },
        { minSpeed: 50, maxSpeed: 100, type: 'rampTone', minTone: 600, maxTone: 1000 }
    ];

    simulator.setToneRanges(toneRanges);

    // Set SPWM settings
    simulator.setSPWMMode('fixed'); // 'fixed' or 'ramp'
    simulator.setCarrierFrequency(1000); // Carrier frequency in Hz

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
    simulator.update();
});
