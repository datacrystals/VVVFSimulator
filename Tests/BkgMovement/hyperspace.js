const canvas = document.getElementById('hyperspaceCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars.forEach(star => {
        star.distance = 0;
        star.velocity = baseVelocity + (Math.random() * velocityVariation);
        star.angle = Math.random() * 2 * Math.PI;
    });
}

window.addEventListener('resize', resizeCanvas);

const numStars = 2000;
const stars = [];
let speed = 0;

const baseVelocity = 0.05;
const velocityPerDistance = 0.002;
const accelerationSensitivity = 0.1;
const minVelocity = 0.05;
const velocityVariation = 0.1;
const minSize = 1;
const maxSize = 10;

function Star(angle) {
    this.angle = angle;
    this.distance = 0;
    this.velocity = baseVelocity + (Math.random() * velocityVariation);
}

for (let i = 0; i < numStars; i++) {
    const angle = Math.random() * 2 * Math.PI;
    stars.push(new Star(angle));
}

const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', function() {
    speed = parseFloat(this.value);
});

let lastTime = performance.now();

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'white';

    stars.forEach(star => {
        const acceleration = baseVelocity * velocityPerDistance + speed * accelerationSensitivity;
        star.velocity += acceleration * deltaTime + Math.random();
        star.velocity = Math.max(minVelocity, star.velocity);
        star.distance += star.velocity;

        if (star.distance > canvas.height) {
            star.distance = 0;
            star.velocity = baseVelocity + (Math.random() * velocityVariation);
            star.angle = Math.random() * 2 * Math.PI;
        }

        const x = canvas.width / 2 + star.distance * Math.cos(star.angle);
        const y = canvas.height / 2 + star.distance * Math.sin(star.angle);

        const clampedDistance = Math.max(0, star.distance);
        const size = minSize + (maxSize - minSize) * (clampedDistance / canvas.height);

        const bloomSizes = [size, size * 1.2, size * 1.4];
        const bloomAlphas = [1, 0.7, 0.4];

        bloomSizes.forEach((bSize, index) => {
            ctx.beginPath();
            ctx.globalAlpha = bloomAlphas[index];
            ctx.arc(x, y, bSize, 0, 2 * Math.PI);
            ctx.fill();
        });
    });

    requestAnimationFrame(animate);
}

animate(performance.now());