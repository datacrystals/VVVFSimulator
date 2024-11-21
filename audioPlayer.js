class AudioPlayer {
    constructor() {
      this.audioContext = null;
      this.bufferSize = 0;  // Will be set by simulator class
      this.maxQueueSize = 0; // Will be set by simulator class
      this.scheduledSources = new Set();
      this.bufferQueue = [];
      this.schedulingWindow = 0.5;  // Schedule 500ms ahead
      this.fadeOverlap = 0.005;     // 5ms crossfade
      this.isUserGesture = false;
      this.isPlaying = false;
      this.scheduleInterval = null;
    }
  
    async initializeAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("[INIT] Audio Context Sample Rate Is " + this.audioContext.sampleRate);
      }
      
      if (this.audioContext.state === 'suspended' && this.isUserGesture) {
        await this.audioContext.resume();
        console.log("[RESUME] Audio Context Resumed");
      }
  
      // Create a gain node for master volume
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
  
    getSampleRate() {
      return this.audioContext?.sampleRate ?? 44100;
    }
  
    async createAudioBuffer(soundData) {
      const audioBuffer = this.audioContext.createBuffer(1, soundData.length, this.audioContext.sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      channelData.set(soundData);  // More efficient than loop
      return audioBuffer;
    }
  
    createBufferSource(buffer, startTime, duration) {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
  
      // Apply fade in
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + this.fadeOverlap);
  
      // Apply fade out
      gainNode.gain.setValueAtTime(1, startTime + duration - this.fadeOverlap);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
      source.start(startTime);
      source.stop(startTime + duration + this.fadeOverlap);
  
      // Cleanup after playback
      source.onended = () => {
        this.scheduledSources.delete(source);
        gainNode.disconnect();
      };
  
      this.scheduledSources.add(source);
      return source;
    }
  
    scheduleNextBuffers() {
      if (!this.isPlaying || !this.audioContext) return;
  
      const now = this.audioContext.currentTime;
      let scheduleTime = now;
  
      // Find the end time of the last scheduled buffer
      for (const source of this.scheduledSources) {
        const sourceEndTime = source._startTime + source.buffer.duration;
        scheduleTime = Math.max(scheduleTime, sourceEndTime - this.fadeOverlap);
      }
  
      // Schedule new buffers until we're ahead by schedulingWindow
      while (this.bufferQueue.length > 0 && scheduleTime < now + this.schedulingWindow) {
        const buffer = this.bufferQueue.shift();
        this.createBufferSource(buffer, scheduleTime, buffer.duration);
        scheduleTime += buffer.duration - this.fadeOverlap;
      }
    }
  
    startScheduling() {
      if (!this.scheduleInterval) {
        this.isPlaying = true;
        // Run scheduling loop every 100ms
        this.scheduleInterval = setInterval(() => this.scheduleNextBuffers(), 100);
      }
    }
  
    stopScheduling() {
      if (this.scheduleInterval) {
        clearInterval(this.scheduleInterval);
        this.scheduleInterval = null;
      }
      this.isPlaying = false;
      
      // Stop all currently playing sources
      for (const source of this.scheduledSources) {
        try {
          source.stop();
        } catch (e) {
          // Ignore errors from already stopped sources
        }
      }
      this.scheduledSources.clear();
      this.bufferQueue = [];
    }
  
    async updateSound(soundData) {
      await this.initializeAudioContext();
      
      const audioBuffer = await this.createAudioBuffer(soundData);
      
      if (this.bufferQueue.length >= this.maxQueueSize) {
        this.bufferQueue.shift();  // Remove oldest buffer if queue is full
      }
      
      this.bufferQueue.push(audioBuffer);
      
      if (!this.isPlaying && this.bufferQueue.length >= 2) {
        this.startScheduling();
      }
      
      if (this.bufferQueue.length < 2) {
        console.log("[WARN] Warning, Audio Buffer Length Low: " + this.bufferQueue.length);
      }
    }
  
    setUserGesture() {
      this.isUserGesture = true;
    }
  
    // Clean up resources
    dispose() {
      this.stopScheduling();
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }
  
  export default AudioPlayer;