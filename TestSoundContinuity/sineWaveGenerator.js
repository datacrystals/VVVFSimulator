class SoundGenerator {
    constructor(config) {
        this.config = {
            "speedRanges": [
                {
                    "minSpeed": 1,
                    "maxSpeed": 10,
                    "spwm": {
                        "type": "fixed",
                        "carrierFrequency": 300
                    }
                },
                {
                    "minSpeed": 10,
                    "maxSpeed": 25,
                    "spwm": {
                        "type": "fixed",
                        "carrierFrequency": 600
                    }
                },
                {
                    "minSpeed": 25,
                    "maxSpeed": 75,
                    "spwm": {
                        "type": "ramp",
                        "minCarrierFrequency": 800,
                        "maxCarrierFrequency": 1200
                    }
                },
                {
                    "minSpeed": 75,
                    "maxSpeed": 125,
                    "spwm": {
                        "type": "ramp",
                        "minCarrierFrequency": 1000,
                        "maxCarrierFrequency": 2000
                    }
                },
                {
                    "minSpeed": 125,
                    "maxSpeed": 201,
                    "spwm": {
                        "type": "ramp",
                        "minCarrierFrequency": 1100,
                        "maxCarrierFrequency": 2200
                    }
                }
            ]
        }.speedRanges;
        this.globalPhase = 0;
    }

    getCommandFrequencyForSpeed(speed) {
        // Define the command frequency based on the train speed
        // For example, a linear ramp from 10 Hz at 0 km/h to 100 Hz at 200 km/h
        return 10 + (speed / 200) * 90;
    }

    getSettingsForSpeed(speed) {
        for (const range of this.config) {
            if (speed >= range.minSpeed && speed < range.maxSpeed) {
                return range;
            }
        }
        return null; // Default settings if no range matches
    }

    generateSineWave(sampleRate, frequency, soundData) {
        const amplitude = 0.5; // Amplitude of the sine wave
        const deltaPhase = (2 * Math.PI * frequency) / sampleRate; // Phase increment per sample
        const length = soundData.length;

        for (let i = 0; i < length; i++) {
            soundData[i] = amplitude * Math.sin(this.globalPhase);
            this.globalPhase += deltaPhase;

            // Ensure the phase stays within the range [0, 2*PI)
            if (this.globalPhase >= 2 * Math.PI) {
                this.globalPhase -= 2 * Math.PI;
            }
        }
    }

    generateSoundData(speed, soundData, commandData, sampleRate = 44100) {

        const commandFrequency = this.getCommandFrequencyForSpeed(speed);
        const settings = this.getSettingsForSpeed(speed);
        const carrierAmplitude = 1;
        const commandAmplitude = 1;
        let carrierFrequency;

        if (settings.spwm.type === 'fixed') {
            carrierFrequency = settings.spwm.carrierFrequency;
        } else if (settings.spwm.type === 'ramp') {
            const ratio = (speed - settings.minSpeed) / (settings.maxSpeed - settings.minSpeed);
            carrierFrequency = settings.spwm.minCarrierFrequency + (settings.spwm.maxCarrierFrequency - settings.spwm.minCarrierFrequency) * ratio;
        }

        // return this.generateSineWave(sampleRate, commandFrequency*20, soundData);

        const carrierFactor = (1 / sampleRate) * carrierFrequency;
        const commandFactor = (1 / sampleRate) * commandFrequency * 2 * Math.PI;

        for (let i = 0; i < soundData.length; i++) {
            const scaledGlobalTime = (this.globalPhase + i * carrierFactor) % 1; // Sawtooth wave
            const command = Math.sin(this.globalPhase + i * commandFactor);

            let output;
            if (command > 0 && command > scaledGlobalTime) {
                output = commandAmplitude;
            } else if (command < 0 && command < -scaledGlobalTime) {
                output = -commandAmplitude;
            } else {
                output = 0;
            }

            soundData[i] = output * 0.5;
            commandData[i] = command * 0.5;
        }

        // Update the global phase based on the number of samples processed
        this.globalPhase += soundData.length * carrierFactor;
        console.log(this.globalPhase);
    }
    
    
}


// export default SoundGenerator;