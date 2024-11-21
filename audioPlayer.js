class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.audioWorkletNode = null;
        this.isUserGesture = false;
        this.isPlaying = false;
        this.bufferSize = 512; // Default buffer size
        this.maxQueueSize = 3; // Default max queue size
        this.sampleRate = 44100; // Default sample rate
        this.soundGenerator = null; // Will be set by the simulator
    }

    async initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("[INIT] Audio Context Sample Rate Is " + this.audioContext.sampleRate);
            this.sampleRate = this.audioContext.sampleRate;
        }

        if (this.audioContext.state === 'suspended' && this.isUserGesture) {
            await this.audioContext.resume();
            console.log("[RESUME] Audio Context Resumed");
        }

        // Load the AudioWorkletProcessor
        await this.audioContext.audioWorklet.addModule('audioProcessor.js');

        // Create the AudioWorkletNode
        this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
        this.audioWorkletNode.connect(this.audioContext.destination);

        // Set the sound generator function
        this.audioWorkletNode.port.onmessage = (event) => {
            if (event.data.type === 'requestSamples') {
                const samples = this.soundGenerator(this.bufferSize, this.sampleRate);
                this.audioWorkletNode.port.postMessage({ type: 'samples', data: samples });
            }
        };
    }

    getSampleRate() {
        return this.sampleRate;
    }

    setSoundGenerator(generator) {
        this.soundGenerator = generator;
    }

    setUserGesture() {
        this.isUserGesture = true;
    }

    // Clean up resources
    dispose() {
        if (this.audioWorkletNode) {
            this.audioWorkletNode.disconnect();
            this.audioWorkletNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

export default AudioPlayer;