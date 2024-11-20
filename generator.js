class SoundGenerator {
    constructor(config) {
        this.config = config;
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

    generateSoundData(speed, canvasWidth) {
        const soundData = new Float32Array(canvasWidth);

        // Check if the speed is below the minimum speed
        if (speed < this.config[0].minSpeed) {
            // Generate a flat signal (all zeros)
            return soundData;
        }

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

        const carrierFactor = 0.05 * carrierFrequency / 1000;
        const commandFactor = 0.01 * commandFrequency / 1000 * 2 * Math.PI;

        for (let i = 0; i < canvasWidth; i++) {
            const carrier = (i * carrierFactor) % 1; // Sawtooth wave
            const command = Math.sin(i * commandFactor);

            let output;
            if (command > 0 && command > carrier) {
                output = commandAmplitude;
            } else if (command < 0 && command < -carrier) {
                output = -commandAmplitude;
            } else {
                output = 0;
            }

            soundData[i] = output * 100;
        }

        return soundData;
    }
}

// Expose the SoundGenerator class globally
self.SoundGenerator = SoundGenerator;
