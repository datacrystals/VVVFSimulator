// speedometer.js
class Speedometer {
    constructor(speedometerCanvas) {
        this.speedometerCanvas = speedometerCanvas;
        this.speedometerCtx = this.speedometerCanvas.getContext('2d');
    }

    clear() {
        this.speedometerCtx.clearRect(0, 0, this.speedometerCanvas.width, this.speedometerCanvas.height);
    }

    drawBackground() {
        const speedometerVerticalOffset = 75;
        const speedometerWidth = this.speedometerCanvas.width / 2.5;
        const speedometerHeight = this.speedometerCanvas.height - speedometerVerticalOffset;
        const marginTop = 20;

        this.speedometerCtx.fillStyle = '#1a1a1a';
        this.speedometerCtx.fillRect(0, marginTop, speedometerWidth, speedometerHeight - marginTop);
    }

    drawBar(trainSpeed, maxSpeed) {
        const speedometerVerticalOffset = 75;
        const speedometerWidth = this.speedometerCanvas.width / 2.5;
        const speedometerHeight = this.speedometerCanvas.height - speedometerVerticalOffset;
        const marginTop = 20;

        const barHeight = (trainSpeed / maxSpeed) * (speedometerHeight - marginTop);
        this.speedometerCtx.fillStyle = '#22aaff';
        this.speedometerCtx.fillRect(0, speedometerHeight - barHeight, speedometerWidth, barHeight);
    }

    drawGraduations(maxSpeed) {
        const speedometerVerticalOffset = 75;
        const speedometerWidth = this.speedometerCanvas.width / 2.5;
        const speedometerHeight = this.speedometerCanvas.height - speedometerVerticalOffset;
        const marginTop = 20;
        const graduationStep = 25;

        this.speedometerCtx.strokeStyle = '#ffffff';
        this.speedometerCtx.lineWidth = 1;

        for (let speed = 0; speed <= maxSpeed; speed += graduationStep) {
            const y = speedometerHeight - (speed / maxSpeed) * (speedometerHeight - marginTop);
            this.speedometerCtx.beginPath();
            this.speedometerCtx.moveTo(0, y);
            this.speedometerCtx.lineTo(speedometerWidth, y);
            this.speedometerCtx.stroke();

            this.speedometerCtx.fillStyle = '#ffffff';
            this.speedometerCtx.font = '14px Arial';
            this.speedometerCtx.fillText(speed, speedometerWidth + 5, y + 5);

            this.speedometerCtx.fillStyle = '#ffffff';
            this.speedometerCtx.font = '12px Arial';
            this.speedometerCtx.fillText('km/h', speedometerWidth + 5, y + 18);
        }
    }

    drawDigitalDisplay(trainSpeed) {
        const speedText = trainSpeed.toFixed(1).padStart(5, '0');
        const textWidth = this.speedometerCtx.measureText(speedText).width;
        const textHeight = 20;
        const boxPadding = 3;
        const boxWidth = this.speedometerCanvas.width - 4;
        const boxHeight = textHeight * 2 + 2 * boxPadding;
        const boxX = 2;
        const boxY = this.speedometerCanvas.height - boxHeight - 2;

        this.speedometerCtx.strokeStyle = '#ffffff';
        this.speedometerCtx.lineWidth = 1;
        this.speedometerCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        this.speedometerCtx.fillStyle = '#00ff00';
        this.speedometerCtx.font = '16px Arial';
        this.speedometerCtx.fillText(speedText, (this.speedometerCanvas.width - textWidth) / 2 - boxPadding - 3, boxY + boxHeight - boxPadding - textHeight);
        this.speedometerCtx.fillStyle = '#ffff00';
        this.speedometerCtx.fillText("km/h", (this.speedometerCanvas.width - textWidth) / 2 - boxPadding, boxY + boxHeight - boxPadding * 3);
    }

    draw(trainSpeed, maxSpeed) {
        this.clear();
        this.drawBackground();
        this.drawBar(trainSpeed, maxSpeed);
        this.drawGraduations(maxSpeed);
        this.drawDigitalDisplay(trainSpeed);
    }
}

export default Speedometer;