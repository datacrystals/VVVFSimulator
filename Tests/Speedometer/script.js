function updateSpeedometer() {
    const topSpeed = parseInt(document.getElementById('top-speed').value);
    const speedometerBar = document.getElementById('speedometer-bar');
    const speedometerGraduations = document.getElementById('speedometer-graduations');

    // Clear existing graduations
    speedometerGraduations.innerHTML = '';

    // Create new graduations
    for (let i = 0; i <= topSpeed; i += 10) {
        const span = document.createElement('span');
        span.textContent = i;
        speedometerGraduations.appendChild(span);
    }

    // Set the width of the speedometer bar (for demonstration, set to 50% of top speed)
    const currentSpeed = (topSpeed * 0.5);
    speedometerBar.style.width = `${(currentSpeed / topSpeed) * 100}%`;
}

// Initial setup
updateSpeedometer();