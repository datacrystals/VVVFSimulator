class SoundGenerator {
    constructor(config) {
        this.config = {
            "speedRanges": [
                {
                    "minSpeed": -1,
                    "maxSpeed": 10,
                    "spwm": {
                        "type": "fixed",
                        "carrierFrequency": 400
                    }
                },
                {
                    "minSpeed": 10,
                    "maxSpeed": 25,
                    "spwm": {
                        "type": "fixed",
                        "carrierFrequency": 800
                    }
                },
                {
                    "minSpeed": 25,
                    "maxSpeed": 75,
                    "spwm": {
                        "type": "ramp",
                        "minCarrierFrequency": 450,
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
        return speed
    }

    getSettingsForSpeed(speed) {
        for (const range of this.config) {
            if (speed >= range.minSpeed && speed < range.maxSpeed) {
                return range;
            }
        }
        return null; // Default settings if no range matches
    }

    generateSample(speed, sampleRate) {
        const commandFrequency = this.getCommandFrequencyForSpeed(speed);
        const settings = this.getSettingsForSpeed(speed);
        const carrierAmplitude = 0.5;
        const commandAmplitude = 0.5;
        let carrierFrequency;

        if (settings.spwm.type === 'fixed') {
            carrierFrequency = settings.spwm.carrierFrequency;
        } else if (settings.spwm.type === 'ramp') {
            const ratio = (speed - settings.minSpeed) / (settings.maxSpeed - settings.minSpeed);
            carrierFrequency = settings.spwm.minCarrierFrequency + (settings.spwm.maxCarrierFrequency - settings.spwm.minCarrierFrequency) * ratio;
        }

        const carrierFactor = (1 / sampleRate) * carrierFrequency;
        const commandFactor = (1 / sampleRate) * commandFrequency * 2 * Math.PI;

        const scaledGlobalTime = (this.globalPhase + carrierFactor) % 1; // Sawtooth wave
        const command = Math.sin(this.globalPhase + commandFactor);

        let output;
        if (command > 0 && command > scaledGlobalTime) {
            output = commandAmplitude;
        } else if (command < 0 && command < -scaledGlobalTime) {
            output = -commandAmplitude;
        } else {
            output = 0;
        }

        // Update the global phase based on the number of samples processed
        this.globalPhase += carrierFactor;

        // Ensure the phase stays within the range [0, 2*PI)
        if (this.globalPhase >= 2 * Math.PI) {
            this.globalPhase -= 2 * Math.PI;
        }

        return {
            soundSample: output * 0.5,
            commandSample: command * 0.5
        };
    }
}

// export default SoundGenerator;
