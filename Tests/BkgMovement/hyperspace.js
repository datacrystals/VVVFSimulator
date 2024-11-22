const canvas = document.getElementById('hyperspaceCanvas');
const ctx = canvas.getContext('2d');

// Initialize canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle class
class Particle {
    constructor() {
        this.centerRadius = 50; // Radius of the central circle
        this.angle = Math.random() * 2 * Math.PI;
        this.x = canvas.width / 2 + this.centerRadius * Math.cos(this.angle);
        this.y = canvas.height / 2 + this.centerRadius * Math.sin(this.angle);
        this.vx = 0;
        this.vy = 0;
        this.speed = 0;
        this.size = 2;
        this.color = 'white';
    }

    update(speedFactor) {
        // Apply acceleration
        const acceleration = 0.01 * speedFactor;
        this.vx += acceleration * Math.cos(this.angle);
        this.vy += acceleration * Math.sin(this.angle);
        this.x += this.vx;
        this.y += this.vy;
        this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.size = 2 + this.speed / 5; // Increase size with speed

        // Reset if offscreen
        if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
            this.reset(speedFactor);
        }
    }

    reset(speedFactor) {
        this.angle = Math.random() * 2 * Math.PI;
        this.x = canvas.width / 2 + this.centerRadius * Math.cos(this.angle);
        this.y = canvas.height / 2 + this.centerRadius * Math.sin(this.angle);
        this.speed = 0;
        this.size = 2;
        this.vx = 0;
        this.vy = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
const numParticles = 500;
const particles = [];
for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

// Speed slider
const speedSlider = document.getElementById('speedSlider');
let speedFactor = parseFloat(speedSlider.value);

speedSlider.addEventListener('input', function() {
    speedFactor = parseFloat(this.value);
});

// Animation loop
function animate() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update(speedFactor);
        particle.draw();
    });

    requestAnimationFrame(animate);
}

animate();