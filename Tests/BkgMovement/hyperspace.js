const canvas = document.getElementById('hyperspaceCanvas');
const ctx = canvas.getContext('2d');

// Initialize canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function distance(point1, point2) {
    // Destructure the x and y coordinates from the points
    const [x1, y1] = point1;
    const [x2, y2] = point2;

    // Calculate the differences in x and y coordinates
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate the distance using the Euclidean distance formula
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
}

// Particle class
class Particle {
    constructor() {
        this.centerRadius = 30; // Radius of the central circle
        this.distnaceScalingFactor = 5;
        this.minSize = 3;

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
        this.x += this.vx * speedFactor;
        this.y += this.vy * speedFactor;
        this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        // this.size = 2 + this.speed / 5; // Increase size with speed

        // Calculate distance from center
        let DistanceFromCenter = distance([canvas.width/2, canvas.height/2], [this.x, this.y]);
        this.size = (DistanceFromCenter / (canvas.width / 2) * this.distnaceScalingFactor) + this.minSize;

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
        this.drawLine(25);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    drawLine(length) {
        // Calculate the direction vector (dx, dy)
        const dx = canvas.width - this.x;
        const dy = canvas.height - this.y;

        // Normalize the direction vector
        const magnitude = distance([canvas.width/2, canvas.height/2], [this.x, this.y]);
        const unitDx = dx / magnitude;
        const unitDy = dy / magnitude;

        // Calculate the end point of the line
        const endX = this.x + unitDx * length;
        const endY = this.y + unitDy * length;

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Function to calculate the distance between two points
function distance(point1, point2) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
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