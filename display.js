// display.js
class OscilloscopeDisplay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sampleRate = 0;
        this.gridSize = 20; // Size of the grid cells
        this.gridColor = 'rgba(255, 255, 255, 0.1)'; // Faint grid color
        this.borderColor = 'rgba(255, 255, 255, 0.5)'; // Border color
        this.borderWidth = 2; // Border width
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

        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x < width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawBorder() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = this.borderColor;
        this.ctx.lineWidth = this.borderWidth;

        this.ctx.strokeRect(0, 0, width, height);
    }

    drawLine(points, color, offsetY, xMargin) {
        const width = this.canvas.width - xMargin;
        const height = this.canvas.height;
        const centerY = height / 2;
        const scaleY = height / 4; // Adjust this value to scale the waveform

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        for (let i = 0; i < points.length; i++) {
            const x = xMargin + (i / (points.length - 1)) * width; // Map sample index to canvas width
            const y = centerY - points[i] * scaleY + offsetY;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    drawYAxisLabels(channels, offsetY) {
        const height = this.canvas.height;
        const centerY = height / 2;
        const scaleY = height / 4; // Adjust this value to scale the waveform

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';

        channels.forEach((points, index) => {
            const yAxisValues = [-1, 0, 1]; // Y-axis values to display
            yAxisValues.forEach(value => {
                const y = centerY - value * scaleY + offsetY;
                this.ctx.fillText(value.toString(), 5, y + 5); // Display value at the left side
            });
        });
    }

    drawOscilloscope(channels, sampleRate) {
        let xMargin = 25;

        this.sampleRate = sampleRate;
        this.clear();
        this.drawBorder();

        channels.forEach((points, index) => {
            const color = `hsl(${index * 120}, 100%, 50%)`; // Generate a unique color for each channel
            const offsetY = (index - 1) * (this.canvas.height / 3); // Shift each signal vertically
            this.drawLine(points, color, offsetY, xMargin);
            this.drawYAxisLabels([points], offsetY); // Draw Y-axis labels for each channel
        });
    }

    getWidth() {
        return this.canvas.width;
    }
}

export default OscilloscopeDisplay;