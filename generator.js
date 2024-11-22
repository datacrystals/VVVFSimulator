class SoundGenerator {
    constructor(config) {
        this.config = config;
        // this.globalPhase = 0;

        let numControlFrequencies = 2;
        this.globalPhases = new Array(numControlFrequencies).fill(0);
    }

    getCommandFrequencyForSpeed(speed) {
        // Define the command frequency based on the train speed
        // For example, a linear ramp from 10 Hz at 0 km/h to 100 Hz at 200 km/h
        return speed;
    }

    getCommandAmplitudeForSpeed(speed) {
        // let FullPowerSpeed = 15;
        // if (speed < FullPowerSpeed) {
        //     return (FullPowerSpeed - speed) / FullPowerSpeed;
        // }
        return 1;
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
        const commandAmplitude = this.getCommandAmplitudeForSpeed(speed);
        const carrierAmplitude = 0.5;
        const powerRail = 0.3;
        let carrierFrequency;

        if (!settings) {
            return {
                soundSample: 0,
                commandSample: 0,
                carrierSample: 0
            };
        }
        if (settings.spwm.type === 'fixed') {
            carrierFrequency = settings.spwm.carrierFrequency;
        } else if (settings.spwm.type === 'ramp') {
            const ratio = (speed - settings.minSpeed) / (settings.maxSpeed - settings.minSpeed);
            carrierFrequency = settings.spwm.minCarrierFrequency + (settings.spwm.maxCarrierFrequency - settings.spwm.minCarrierFrequency) * ratio;
        }



        // Generate the carrier sample and command sample
        const carrierFactor = (2 * Math.PI / sampleRate) * carrierFrequency;
        const carrier = ((this.globalPhases[0] + carrierFactor) % Math.PI) / Math.PI; // Sawtooth wave with period π
        this.globalPhases[0] += carrierFactor;

        const commandFactor = (2 * Math.PI * commandFrequency / sampleRate);
        const command = Math.sin(this.globalPhases[1] + commandFactor) * commandAmplitude;
        this.globalPhases[1] += commandFactor;

        let output;
        if (command > 0 && command > carrier) {
            output = powerRail;
        } else if (command < 0 && command < -carrier) {
            output = -powerRail;
        } else {
            output = 0;
        }


        // Ensure the phases stay within the range [0, 2*PI)
        this.wrapPhases();

        return {
            soundSample: output * 0.5,
            commandSample: command * 0.5,
            carrierSample: carrier * 0.5
        };
    }


    // Function to check and wrap the limits of every element in the globalPhases array
    wrapPhases() {
        const twoPi = 2 * Math.PI;
        for (let i = 0; i < this.globalPhases.length; i++) {
            if (this.globalPhases[i] >= twoPi) {
                this.globalPhases[i] -= twoPi;
            }
        }
    }

}

export default SoundGenerator;
