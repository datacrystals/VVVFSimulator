
function raiseAndNormalize(inputValue, exponent) {
    // Step 1: Determine the sign of the input value
    const sign = Math.sign(inputValue);
    
    // Step 2: Take the absolute value
    const absValue = Math.abs(inputValue);
    
    // Step 3: Raise it to the exponent
    const poweredAbsValue = Math.pow(absValue, exponent);
    
    // Step 4: Normalize back to -1 to 1
    const normalizedValue = (poweredAbsValue * 2) - 1;
    
    // Step 5: Restore the original sign
    return normalizedValue * sign;
  }


class SoundGenerator {
    constructor(config) {
        this.config = config.speedRanges;
        this.fullConfig = config;
        let numControlFrequencies = 2;
        this.globalPhases = new Array(numControlFrequencies).fill(0);
    }

    getCommandFrequencyForSpeed(speed) {
        return speed;
    }

    getCommandAmplitudeForSpeed(speed) {
        const settings = this.getSettingsForSpeed(speed);
        if (!settings || !settings.spwm.amplitudeModifiers) {
            return 1; // Default amplitude if no modifiers are specified
        }
        return this.applyAmplitudeModifiers(settings.spwm.amplitudeModifiers, speed, settings);
    }

    applyAmplitudeModifiers(modifiers, speed, settings) {
        let amplitude = 1; // Default amplitude
        for (const modifier of modifiers) {
            switch (modifier.type) {
                case 'constant':
                    amplitude = this.applyConstantAmplitude(modifier.value);
                    break;
                case 'ramp':
                    amplitude = this.applyRampAmplitude(modifier, speed, settings);
                    break;
                // Add more cases for other types of modifiers as needed
                default:
                    console.warn(`Unknown amplitude modifier type: ${modifier.type}`);
            }
        }
        return amplitude;
    }

    applyConstantAmplitude(value) {
        // Template function for constant amplitude
        return value;
    }

    applyRampAmplitude(modifier, speed, settings) {
        // Template function for ramp amplitude
        const ratio = (speed - settings.minSpeed) / (settings.maxSpeed - settings.minSpeed);
        return modifier.startValue + (modifier.endValue - modifier.startValue) * ratio;
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
        if (speed === 0) {
            return {
                soundSample: 0,
                commandSample: 0,
                carrierSample: 0
            };
        }

        const settings = this.getSettingsForSpeed(speed);

        let gearRatioMultiplier = this.fullConfig.motorGearRatio;
        let commandFrequency = this.getCommandFrequencyForSpeed(speed / gearRatioMultiplier);
        const commandAmplitude = this.getCommandAmplitudeForSpeed(speed);
        const carrierAmplitude = 0.5;
        const powerRail = commandAmplitude;
        let carrierOffsetPhase = 0;
        let carrierFrequency = 0;

        let carrierMode = "sawtooth";

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
        } else if (settings.spwm.type === 'sync') {
            const pulseMode = settings.spwm.pulseMode;
            carrierFrequency = pulseMode * commandFrequency;
            carrierMode = "triangle";
          }
        const carrierFactor = (2 * Math.PI / sampleRate) * carrierFrequency;
        let carrier = 0;
        if (carrierMode === "sawtooth") {
            carrier = ((this.globalPhases[0] + carrierFactor + carrierOffsetPhase) % Math.PI) / Math.PI; // Sawtooth wave with period π
        } else if (carrierMode === "triangle") {
            carrier = Math.abs((((this.globalPhases[0] + carrierFactor + carrierOffsetPhase) % Math.PI) / Math.PI) * 2 - 1); // Triangle wave with period π
        }
        this.globalPhases[0] += carrierFactor;

        const commandFactor = (2 * Math.PI * commandFrequency / sampleRate);
        let command = Math.sin(this.globalPhases[1] + commandFactor) * commandAmplitude;
               
        // For wide pulse mode, we just exagerate the command request a bit to make it wider pulses
        if (settings.spwm.widePulse) {
            command = command*settings.spwm.modulationIndex;
        }

        this.globalPhases[1] += commandFactor;

        let output;
        if (command > 0 && command > carrier) {
            output = powerRail;
        } else if (command < 0 && command < -carrier) {
            output = -powerRail;
        } else {
            output = 0;
        }

        this.wrapPhases();

        return {
            soundSample: output,
            commandSample: command,
            carrierSample: carrier
        };
    }

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