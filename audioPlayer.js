class AudioPlayer {
    constructor(sampleRate, bufferSize) {
        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;
        this.audioContext = null;
        this.scriptProcessor = null;
        this.generator = null;
    }

    setGenerator(generator) {
        this.generator = generator;
    }

    handleAudioProcess(audioProcessingEvent) {
        if (!this.generator || !this.generator.generateSample) {
            console.error('Generator not set or does not have generateSample method');
            return;
        }

        const outputBuffer = audioProcessingEvent.outputBuffer.getChannelData(0);

        for (let i = 0; i < this.bufferSize; i++) {
            outputBuffer[i] = this.generator.generateSample();
        }
    }

    initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
            this.scriptProcessor.connect(this.audioContext.destination);
            this.scriptProcessor.onaudioprocess = this.handleAudioProcess.bind(this);
        }
    }

    play() {
        if (!this.audioContext) {
            this.initializeAudioContext();
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    stop() {
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
        }
    }
}

export default AudioPlayer;