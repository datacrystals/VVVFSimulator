class OscilloscopeDisplay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    drawGrid(sampleRate) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const gridSize = 100; // Size of each grid square
        const timeInterval = (width / gridSize) / sampleRate * 1e6; // Time interval in microseconds

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw x-axis labels in microseconds
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let x = 0; x <= width; x += gridSize) {
            const time = (x / width) * (width / gridSize) * timeInterval;
            ctx.fillText(time.toFixed(0) + ' µs', x, height - 10);
        }

        // Draw y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = 0; y <= height; y += gridSize) {
            ctx.fillText((height / 2 - y).toString(), width - 10, y);
        }
    }

    drawOscilloscope(soundData, sampleRate) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid(sampleRate);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
    
        const width = this.canvas.width;
        const scaleFactor = width / soundData.length; // Scale factor based on canvas width and number of samples
    
        for (let i = 0; i < soundData.length; i++) {
            const x = i * scaleFactor; // Scale the x position
            const y = this.canvas.height / 2 - soundData[i]; // Keep the y position as is
            this.ctx.lineTo(x, y);
        }
    
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.stroke();
    }
    
    
    
    
}

export default OscilloscopeDisplay;
