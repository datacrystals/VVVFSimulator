// Check sensor support
if (!('geolocation' in navigator)) {
    alert('Geolocation is not supported on this device.');
}
if (!('Accelerometer' in window)) {
    alert('Accelerometer is not supported on this device.');
}

// Constants
const SPEED_UNIT = 'km/h';
const ACCELERATION_UNIT = 'm/s²';
const ACCELERATING_THRESHOLD = 0.5; // m/s²
const BRAKING_THRESHOLD = -0.5; // m/s²
const MAX_SPEED = 200; // km/h

// Variables
let currentSpeed = 0;
let currentAcceleration = 0;
let mode = 'Coasting';
let lastSpeed = 0;
let lastTimestamp = Date.now();
const accelerationFilter = new MovingAverageFilter(5);

// Accelerometer instance
const accelerometer = new Accelerometer({ frequency: 60 });
accelerometer.addEventListener('reading', () => {
    currentAcceleration = accelerationFilter.update(accelerometer.acceleration.x);
});

// Geolocation options
const geoOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

// Geolocation callbacks
function successCallback(position) {
    const speed = position.coords.speed * 3.6; // Convert to km/h
    if (lastSpeed !== 0) {
        const currentTime = Date.now();
        const timeDifference = (currentTime - lastTimestamp) / 1000;
        const gpsAcceleration = (speed - lastSpeed) / timeDifference;
        // Cross-check with accelerometer data
        if (currentAcceleration > ACCELERATING_THRESHOLD && gpsAcceleration > ACCELERATING_THRESHOLD) {
            mode = 'Accelerating';
        } else if (currentAcceleration < BRAKING_THRESHOLD && gpsAcceleration < BRAKING_THRESHOLD) {
            mode = 'Braking';
        } else {
            mode = 'Coasting';
        }
    }
    currentSpeed = speed;
    lastSpeed = speed;
    lastTimestamp = Date.now();
}

function errorCallback(error) {
    console.error('Geolocation error:', error);
}

// Start watching position
navigator.geolocation.watchPosition(successCallback, errorCallback, geoOptions);

// Drawing the speedometer
const canvas = document.getElementById('speedometerCanvas');
const ctx = canvas.getContext('2d');

function drawSpeedometer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw speedometer background
    ctx.beginPath();
    ctx.arc(200, 200, 180, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    // Draw speedometer needle
    const angle = (currentSpeed / MAX_SPEED) * 180 - 90; // Convert speed to angle
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(angle * (Math.PI / 180));
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.lineTo(20, 0);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
    // Update mode display
    document.getElementById('modeDisplay').innerText = `Mode: ${mode}`;
}

// Update display every 200 milliseconds
setInterval(drawSpeedometer, 200);

// Simple moving average filter
class MovingAverageFilter {
    constructor(size) {
        this.size = size;
        this.values = [];
    }
    update(value) {
        this.values.push(value);
        if (this.values.length > this.size) {
            this.values.shift();
        }
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }
}