class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.bufferSize = 4096; // Increase the buffer size
        this.audioBufferQueue = [];
        this.maxQueueSize = 5; // Maximum number of buffers in the queue
    }

    async initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async createAudioBuffer(soundData) {
        const audioBuffer = this.audioContext.createBuffer(1, soundData.length, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < soundData.length; i++) {
            channelData[i] = soundData[i] / 100; // Normalize to range [-1, 1]
        }
        return audioBuffer;
    }

    async playSound(audioBuffer) {
        if (audioBuffer) {
            this.sourceNode = this.audioContext.createBufferSource();
            this.sourceNode.buffer = audioBuffer;
            this.sourceNode.connect(this.audioContext.destination);
            this.sourceNode.start(0);
            this.sourceNode.onended = () => {
                if (this.audioBufferQueue.length > 0) {
                    const nextBuffer = this.audioBufferQueue.shift();
                    this.playSound(nextBuffer);
                }
            };
        }
    }

    async updateSound(soundData) {
        await this.initializeAudioContext();
        const audioBuffer = await this.createAudioBuffer(soundData);
        if (this.audioBufferQueue.length >= this.maxQueueSize) {
            // Drop the oldest buffer if the queue is too large
            this.audioBufferQueue.shift();
        }
        this.audioBufferQueue.push(audioBuffer);
        if (!this.sourceNode || !this.sourceNode.buffer) {
            const nextBuffer = this.audioBufferQueue.shift();
            this.playSound(nextBuffer);
        }
    }
}

export default AudioPlayer;
