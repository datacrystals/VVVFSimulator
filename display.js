class OscilloscopeDisplay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.chart = null;
    }

    initializeChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Time (s)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amplitude'
                        },
                        min: -1.5, // Set the minimum value of the y-axis
                        max: 1.5,  // Set the maximum value of the y-axis
                        ticks: {
                            stepSize: 50 // Set the step size for the y-axis ticks
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 0 // Disable animation for instantaneous updates
                }
            }
        });
    }

    clear() {
        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets = [];
            this.chart.update('none'); // Update the chart without animation
        }
    }

    drawLine(points, color) {
        if (!this.chart) {
            this.initializeChart();
        }
        

        const timeLabels = points.map((_, i) => i / this.sampleRate);
        this.chart.data.labels = timeLabels;

        this.chart.data.datasets.push({
            label: 'Channel',
            data: points,
            borderColor: color,
            fill: false,
            tension: 0, // Ensure no tension for instantaneous updates
            stepped: false // Ensure no stepping for instantaneous updates
        });

        this.chart.update('none'); // Update the chart without animation
    }

    drawOscilloscope(channels, sampleRate) {
        this.sampleRate = sampleRate;
        this.clear();
        channels.forEach((points, index) => {
            const color = `hsl(${index * 120}, 100%, 50%)`; // Generate a unique color for each channel
            this.drawLine(points, color);
        });
    }
}

export default OscilloscopeDisplay;
