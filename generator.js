
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
    constructor(config, sampleRate) {
        this.config = config.speedRanges;
        this.fullConfig = config;

        this.epsilon = 0.001; // Small margin for floating-point comparisons

        this.historySize = 15; // Number of samples to average over
        this.sampleInterval = 0.01; // Collect a speed sample every 0.01 seconds
        this.modeCheckInterval = 0.15; // Check the mode every 0.15 seconds
        this.sampleRate = sampleRate;


        this.sampleCounter = 0; // Counter to track the number of samples
        this.sampleInterval = Math.floor(this.sampleInterval * sampleRate); // Collect a speed sample every 0.01 seconds (441 samples at 44.1kHz)
        this.modeCheckInterval = Math.floor(this.modeCheckInterval * sampleRate); // Check the mode every 0.15 seconds (6615 samples at 44.1kHz)

        this.speedHistory = new Array(this.historySize).fill(0); // Array to store the last 10 speed samples

        let numControlFrequencies = 2;
        
        this.globalPhases = new Array(numControlFrequencies).fill(0);
    }

    getCommandFrequencyForSpeed(speed) {
        return speed;
    }

    getCommandAmplitudeForSpeed(speed) {
        const settings = this.getSettingsForSpeed(speed);
        if (!settings || !settings.Selected.spwm.amplitudeModifiers) {
            return 1; // Default amplitude if no modifiers are specified
        }
        return this.applyAmplitudeModifiers(settings.Selected.spwm.amplitudeModifiers, speed, settings);
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
        // Collect a speed sample only if the sample interval has passed
        if (this.sampleCounter % this.sampleInterval === 0) {
            this.speedHistory.push(speed);
            if (this.speedHistory.length > this.modeCheckInterval / this.sampleInterval) {
                this.speedHistory.shift(); // Remove the oldest sample if history exceeds the size
            }
        }

        // Check the mode only if the mode check interval has passed
        if (this.sampleCounter % this.modeCheckInterval === 0) {
            // Calculate the average speed change over the history
            let averageChange = 0;
            if (this.speedHistory.length > 1) {
                for (let i = 1; i < this.speedHistory.length; i++) {
                    averageChange += this.speedHistory[i] - this.speedHistory[i - 1];
                }
                averageChange /= (this.speedHistory.length - 1);
            }

            // Determine the mode based on the average speed change
            if (averageChange > 0) {
                this.currentMode = 'Acceleration';
            } else if (averageChange < 0) {
                this.currentMode = 'Brake';
            } else {
                this.currentMode = 'Neutral';
            }
        }

        // Increment the sample counter
        this.sampleCounter++;


        for (const range of this.config) {
            if (speed >= range.minSpeed && speed < range.maxSpeed) {
                // Check for the current mode in the range
                if (range[this.currentMode]) {
                    let modifiedRange = range;
                    modifiedRange["Selected"] = range[this.currentMode];
                    return modifiedRange;
                }
                // Fallback to AccelerationBrakeNeutral if specific mode not found
                if (range['AccelerationBrakeNeutral']) {
                    let modifiedRange = range;
                    modifiedRange["Selected"] = range["AccelerationBrakeNeutral"];
                    return modifiedRange;
                }
                // Fallback to any available mode
                if (range['Acceleration']) {
                    let modifiedRange = range;
                    modifiedRange["Selected"] = range["Acceleration"];
                    console.log(modifiedRange);
                    return modifiedRange;
                }
                if (range['Brake']) {
                    let modifiedRange = range;
                    modifiedRange["Selected"] = range["Brake"];
                    return modifiedRange;
                }
                if (range['Neutral']) {
                    let modifiedRange = range;
                    modifiedRange["Selected"] = range["Neutral"];
                    return modifiedRange;
                }

                // Default to the range itself if no mode is specified (legacy config)
                let modifiedRange = range;
                modifiedRange["Selected"] = range;
                return modifiedRange;
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

        if (settings.Selected.spwm.type === 'fixed') {
            carrierFrequency = settings.Selected.spwm.carrierFrequency;
        } else if (settings.Selected.spwm.type === 'ramp') {
            const ratio = (speed - settings.minSpeed) / (settings.maxSpeed - settings.minSpeed);
            carrierFrequency = settings.Selected.spwm.minCarrierFrequency + (settings.Selected.spwm.maxCarrierFrequency - settings.Selected.spwm.minCarrierFrequency) * ratio;
        } else if (settings.Selected.spwm.type === 'sync') {
            const pulseMode = settings.Selected.spwm.pulseMode;
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
        if (settings.Selected.spwm.widePulse) {
            command = command*settings.Selected.spwm.modulationIndex;
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