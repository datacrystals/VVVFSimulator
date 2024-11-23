// VerticalLinearBar.js
class VerticalLinearBar {
    constructor(canvas, options, config) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.options = options;
        this.config = config;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        const { verticalOffset, width, height, marginTop } = this.options;
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, marginTop, width, height - marginTop);
    }

    drawBar(value) {
        const { verticalOffset, width, height, marginTop, maxValue, color, centered, positiveOnly } = this.options;
        let barHeight;

        if (positiveOnly) {
            // Ensure value is non-negative
            value = Math.max(0, value);
            barHeight = (value / maxValue) * (height - marginTop);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, height - barHeight, width, barHeight);
        } else if (centered) {
            barHeight = (Math.abs(value) / maxValue) * (height - marginTop) / 2;
            this.ctx.fillStyle = value >= 0 ? color : '#8b4513'; // Blue for positive, brown for negative
            this.ctx.fillRect(0, height / 2 - (value <= 0 ? 0 : barHeight), width, barHeight);
        } else {
            barHeight = (Math.abs(value) / maxValue) * (height - marginTop) / 2;
            this.ctx.fillStyle = value >= 0 ? color : '#8b4513'; // Blue for positive, brown for negative
            this.ctx.fillRect(0, height / 2 - (value <= 0 ? 0 : barHeight), width, barHeight);
        }
    }

    drawGraduations() {
        const { verticalOffset, width, height, marginTop, maxValue, unit, centered, positiveOnly } = this.options;
        const { graduationStep } = this.config;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;

        for (let value = -maxValue; value <= maxValue; value += graduationStep) {
            if (positiveOnly && value < 0) continue; // Skip negative values if positiveOnly is true

            let y;
            if (centered) {
                y = height / 2 - (value / maxValue) * (height - marginTop) / 2;
            } else if (positiveOnly) {
                y = height - (value / maxValue) * (height - marginTop);
            } else {
                y = height / 2 - (value / maxValue) * (height - marginTop) / 2;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(value, width + 5, y + 5);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(unit, width + 5, y + 18);
        }
    }

    drawDigitalDisplay(value) {
        const { unit } = this.options;
        const valueText = value.toFixed(1).padStart(5, '0');
        const textWidth = this.ctx.measureText(valueText).width;
        const textHeight = 20;
        const boxPadding = 3;
        const boxWidth = this.canvas.width - 4;
        const boxHeight = textHeight * 2 + 2 * boxPadding;
        const boxX = 2;
        const boxY = this.canvas.height - boxHeight - 2;

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(valueText, (this.canvas.width - textWidth) / 2 - boxPadding - 3, boxY + boxHeight - boxPadding - textHeight);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(unit, (this.canvas.width - textWidth) / 2 - boxPadding, boxY + boxHeight - boxPadding * 3);
    }

    draw(value) {
        this.clear();
        this.drawBackground();
        this.drawBar(value);
        this.drawGraduations();
        this.drawDigitalDisplay(value);
    }
}

export default VerticalLinearBar;