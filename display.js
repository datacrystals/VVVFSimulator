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
    
        // Calculate the space required for labels
        const labelPadding = 20; // Padding around labels
        const xLabelHeight = 20; // Height of x-axis labels
        const yLabelWidth = 40; // Width of y-axis labels
        const textMargin = 10; // Margin around text labels
        const xAxisPadding = 20; // Additional padding on the right side of the x-axis
    
        // Adjust the plotting area to accommodate labels and margins
        const plotPosX = posX + yLabelWidth + textMargin;
        const plotPosY = posY + textMargin;
        const plotWidth = width - yLabelWidth - 2 * textMargin - xAxisPadding;
        const plotHeight = height - xLabelHeight - 2 * textMargin;
    
        // Clear the specified plotting area
        ctx.clearRect(posX, posY, width, height);
    
        // Draw the border around the plotting area
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(posX, posY, width, height);
    
        // Calculate scaling factors
        const numSamples = data.length;
        const totalTime = (numSamples - 1) / sampleRate; // Total time in seconds
        const xScale = plotWidth / totalTime; // Pixels per second
        yMin = yMin !== undefined ? yMin : Math.min(...data);
        yMax = yMax !== undefined ? yMax : Math.max(...data);
        const yRange = yMax - yMin;
        const yScale = plotHeight / yRange; // Pixels per unit amplitude
    
        // Draw x-axis and y-axis
        ctx.beginPath();
        ctx.moveTo(plotPosX, plotPosY + plotHeight); // Start of x-axis
        ctx.lineTo(plotPosX + plotWidth, plotPosY + plotHeight); // End of x-axis
        ctx.moveTo(plotPosX, plotPosY); // Start of y-axis
        ctx.lineTo(plotPosX, plotPosY + plotHeight); // End of y-axis
        ctx.strokeStyle = 'white'; // Axis color
        ctx.stroke();
    
        // Draw x-axis ticks and labels
        numXTicks = numXTicks < 2 ? 2 : numXTicks;
        const tickIntervalX = totalTime / (numXTicks - 1);
        for (let i = 0; i < numXTicks; i++) {
            const time = i * tickIntervalX;
            const x = plotPosX + time * xScale;
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(x, plotPosY + plotHeight);
            ctx.lineTo(x, plotPosY + plotHeight + 5);
            ctx.stroke();
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText(time.toFixed(3), x, plotPosY + plotHeight + 3 + textMargin);
        }
    
        // Draw y-axis ticks and labels
        const tickIntervalY = yRange / 5; // 5 ticks
        for (let i = 0; i <= 5; i++) {
            const value = yMin + i * tickIntervalY;
            const y = plotPosY + plotHeight - (value - yMin) * yScale;
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(plotPosX - 5, y);
            ctx.lineTo(plotPosX, y);
            ctx.stroke();
            // Draw label
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText(value.toFixed(2), plotPosX - 5 - textMargin, y);
        }
    
        // Draw grid lines
        // Vertical grid lines
        for (let i = 0; i < numXTicks; i++) {
            const time = i * tickIntervalX;
            const x = plotPosX + time * xScale;
            ctx.beginPath();
            ctx.moveTo(x, plotPosY);
            ctx.lineTo(x, plotPosY + plotHeight);
            ctx.strokeStyle = gridColor;
            ctx.stroke();
        }
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const value = yMin + i * tickIntervalY;
            const y = plotPosY + plotHeight - (value - yMin) * yScale;
            ctx.beginPath();
            ctx.moveTo(plotPosX, y);
            ctx.lineTo(plotPosX + plotWidth, y);
            ctx.strokeStyle = gridColor;
            ctx.stroke();
        }
    
        // Plot the data line
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
    
        // Start point
        const x0 = plotPosX + 0; // Time = 0
        const y0 = plotPosY + plotHeight - (data[0] - yMin) * yScale;
        ctx.moveTo(x0, y0);
    
        // Draw the line
        for (let i = 1; i < numSamples; i++) {
            const x = plotPosX + (i / sampleRate) * xScale;
            const y = plotPosY + plotHeight - (data[i] - yMin) * yScale;
            ctx.lineTo(x, y);
        }
    
        ctx.stroke();
    
        // Draw label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'yellow';
        ctx.font = '18px Arial';
        const labelWidth = ctx.measureText(label).width;
        const labelHeight = 18; // Approximate height of the label text
        const labelPosX = plotPosX + plotWidth - textMargin;
        const labelPosY = plotPosY + textMargin;
    
        // Draw box around the label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(labelPosX - labelWidth - 5, labelPosY, labelWidth + 10, labelHeight + 5);
    
        // Draw the label text
        ctx.fillStyle = 'yellow';
        ctx.fillText(label, labelPosX, labelPosY + 2);
    
        // Restore the canvas state
        ctx.restore();
    }

    drawOscilloscope(channels, sampleRate) {
        let xMargin = 15;
        let yMargin = 15;
    
        this.sampleRate = sampleRate;
        this.clear();
    
        channels.forEach((channel, index) => {
            const { data, label, yMin, yMax, numXTicks } = channel;
            const color = `hsl(${index * 120}, 100%, 50%)`; // Generate a unique color for each channel
            const posY = index * (this.canvas.height / channels.length);
            const channelWidth = this.canvas.width - 2 * xMargin;
            const channelHeight = ((this.canvas.height - yMargin*channels.length) / (channels.length)) - yMargin;
    

            this.drawLine(
                this.ctx,
                data,
                sampleRate,
                xMargin,
                posY + yMargin,
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