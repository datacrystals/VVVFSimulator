class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.samplesQueue = [];
        this.port.onmessage = (event) => {
            if (event.data.type === 'samples') {
                this.samplesQueue.push(event.data.data);
            }
        };
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const channel = output[0];

        if (this.samplesQueue.length > 0) {
            const samples = this.samplesQueue.shift();
            for (let i = 0; i < channel.length; i++) {
                channel[i] = samples[i];
            }
        } else {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = 0;
            }
        }

        // Request more samples if the queue is running low
        if (this.samplesQueue.length < 2) {
            this.port.postMessage({ type: 'requestSamples' });
        }

        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);