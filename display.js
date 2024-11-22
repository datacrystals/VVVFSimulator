class OscilloscopeDisplay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sampleRate = 0;
    }

    clear() {
        // Draw the grid background
        this.drawGrid();

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const gridSize = 20; // Size of the grid cells
        const gridColor = 'rgba(255, 255, 255, 0.1)'; // Faint grid color

        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawLine(points, color, offsetY) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerY = height / 2;
        const scaleY = height / 4; // Adjust this value to scale the waveform

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        for (let i = 0; i < points.length; i++) {
            const x = (i / (points.length - 1)) * width; // Map sample index to canvas width
            const y = centerY - points[i] * scaleY + offsetY;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    drawOscilloscope(channels, sampleRate) {
        this.sampleRate = sampleRate;
        this.clear();

        channels.forEach((points, index) => {
            const color = `hsl(${index * 120}, 100%, 50%)`; // Generate a unique color for each channel
            const offsetY = (index - 1) * (this.canvas.height / 3); // Shift each signal vertically
            this.drawLine(points, color, offsetY);
        });
    }

    getWidth() {
        return this.canvas.width;
    }
}

export default OscilloscopeDisplay;