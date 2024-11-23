// display.js
class OscilloscopeDisplay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sampleRate = 0;
        this.gridSize = 20; // Size of the grid cells
        this.gridColor = 'rgba(255, 255, 255, 0.1)'; // Faint grid color
        this.borderColor = 'white'; // Border color
        this.borderWidth = 2; // Border width
    }

    clear() {
        // Set canvas background to black
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLine(ctx, data, sampleRate, posX, posY, width, height, lineColor, gridColor, borderColor, font = '12px Arial', yMin = undefined, yMax = undefined, label = '', numXTicks = 5) {
        // Save the current canvas state
        ctx.save();
    
        // Clear the specified plotting area
        ctx.clearRect(posX, posY, width, height);
    
        // Draw the border around the plotting area
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(posX, posY, width, height);
    
        // Calculate scaling factors
        const numSamples = data.length;
        const totalTime = (numSamples - 1) / sampleRate; // Total time in seconds
        const xScale = width / totalTime; // Pixels per second
        yMin = yMin !== undefined ? yMin : Math.min(...data);
        yMax = yMax !== undefined ? yMax : Math.max(...data);
        const yRange = yMax - yMin;
        const yScale = height / yRange; // Pixels per unit amplitude
    
        // Draw x-axis and y-axis
        ctx.beginPath();
        ctx.moveTo(posX, posY + height); // Start of x-axis
        ctx.lineTo(posX + width, posY + height); // End of x-axis
        ctx.moveTo(posX, posY); // Start of y-axis
        ctx.lineTo(posX, posY + height); // End of y-axis
        ctx.strokeStyle = 'white'; // Axis color
        ctx.stroke();
    
        // Draw x-axis ticks and labels
        numXTicks = numXTicks < 2 ? 2 : numXTicks;
        const tickIntervalX = totalTime / (numXTicks - 1);
        for (let i = 0; i < numXTicks; i++) {
            const time = i * tickIntervalX;
            const x = posX + time * xScale;
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(x, posY + height);
            ctx.lineTo(x, posY + height + 5);
            ctx.stroke();
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText(time.toFixed(2), x, posY + height + 10);
        }
    
        // Draw y-axis ticks and labels
        const tickIntervalY = yRange / 5; // 5 ticks
        for (let i = 0; i <= 5; i++) {
            const value = yMin + i * tickIntervalY;
            const y = posY + height - (value - yMin) * yScale;
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(posX - 5, y);
            ctx.lineTo(posX, y);
            ctx.stroke();
            // Draw label
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText(value.toFixed(2), posX - 10, y);
        }
    
        // Draw grid lines
        // Vertical grid lines
        for (let i = 0; i < numXTicks; i++) {
            const time = i * tickIntervalX;
            const x = posX + time * xScale;
            ctx.beginPath();
            ctx.moveTo(x, posY);
            ctx.lineTo(x, posY + height);
            ctx.strokeStyle = gridColor;
            ctx.stroke();
        }
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const value = yMin + i * tickIntervalY;
            const y = posY + height - (value - yMin) * yScale;
            ctx.beginPath();
            ctx.moveTo(posX, y);
            ctx.lineTo(posX + width, y);
            ctx.strokeStyle = gridColor;
            ctx.stroke();
        }
    
        // Plot the data line
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
    
        // Start point
        const x0 = posX + 0; // Time = 0
        const y0 = posY + height - (data[0] - yMin) * yScale;
        ctx.moveTo(x0, y0);
    
        // Draw the line
        for (let i = 1; i < numSamples; i++) {
            const x = posX + (i / sampleRate) * xScale;
            const y = posY + height - (data[i] - yMin) * yScale;
            ctx.lineTo(x, y);
        }
    
        ctx.stroke();
    
        // Draw label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'white';
        ctx.font = font;
        ctx.fillText(label, posX + width - 10, posY + height - 10);
    
        // Restore the canvas state
        ctx.restore();
    }


    drawOscilloscope(channels, sampleRate) {
        let xMargin = 25;
    
        this.sampleRate = sampleRate;
        this.clear();
    
        channels.forEach((channel, index) => {
            const { data, label, yMin, yMax, numXTicks } = channel;
            const color = `hsl(${index * 120}, 100%, 50%)`; // Generate a unique color for each channel
            const posY = index * (this.canvas.height / channels.length);
            const channelWidth = this.canvas.width - 2 * xMargin;
            const channelHeight = this.canvas.height / (channels.length + 1);
    
            this.drawLine(
                this.ctx,
                data,
                sampleRate,
                xMargin,
                posY + xMargin,
                channelWidth,
                channelHeight,
                color,
                this.gridColor,
                this.borderColor,
                '12px Arial',
                yMin,
                yMax,
                label,
                numXTicks || 5
            );
        });
    }

    getWidth() {
        return this.canvas.width;
    }
}

export default OscilloscopeDisplay;