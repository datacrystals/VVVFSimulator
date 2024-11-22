const canvas = document.getElementById('hyperspaceCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

const numStars = 100;
const stars = [];
let speed = 0;

function Star(angle, distance) {
    this.angle = angle;
    this.distance = distance;
    this.speedMultiplier = 1 + speed;
}

for (let i = 0; i < numStars; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * canvas.height;
    stars.push(new Star(angle, distance));
}

const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', function() {
    speed = parseFloat(this.value);
    stars.forEach(star => {
        star.speedMultiplier = 1 + speed;
    });
});

function animate() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    stars.forEach(star => {
        star.distance += star.speedMultiplier;
        if (star.distance > canvas.height * 2) {
            star.distance = -canvas.height;
            star.angle = Math.random() * 2 * Math.PI;
        }

        const x = canvas.width / 2 + star.distance * Math.cos(star.angle);
        const y = canvas.height / 2 + star.distance * Math.sin(star.angle);

        const size = Math.max(0, Math.min(5, 5 * (1 - star.distance / (canvas.height * 2))));
        ctx.arc(x, y, size, 0, 2 * Math.PI);
    });
    ctx.fillStyle = 'white';
    ctx.fill();

    requestAnimationFrame(animate);
}

animate();