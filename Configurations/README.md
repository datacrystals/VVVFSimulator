# Sound Generator Configuration Documentation

This document describes the structure and usage of the JSON configuration file for the `SoundGenerator` class. The configuration file defines how the sound generator behaves at different speed ranges and modes (Acceleration, Brake, Neutral).

---

## Configuration File Structure

The configuration file is a JSON object with the following top-level fields:

```json
{
    "name": "Configuration Name",
    "manufacturer": "Manufacturer Name",
    "date": "YYYY-MM-DD",
    "description": "Description of the configuration",
    "maxAcceleration_kmh_s": "Maximum acceleration in km/h/s",
    "motorGearRatio": "Gear ratio of the motor",
    "maxSpeed_kmh": "Maximum speed in km/h",
    "speedRanges": [
        {
            "minSpeed": "Minimum speed for this range",
            "maxSpeed": "Maximum speed for this range",
            "Acceleration": {
                "spwm": {
                    "type": "Type of SPWM (e.g., fixed, ramp, sync)",
                    "carrierFrequency": "Carrier frequency for fixed type",
                    "minCarrierFrequency": "Minimum carrier frequency for ramp type",
                    "maxCarrierFrequency": "Maximum carrier frequency for ramp type",
                    "pulseMode": "Pulse mode for sync type",
                    "widePulse": "Boolean indicating if wide pulse mode is enabled",
                    "modulationIndex": "Modulation index for wide pulse mode",
                    "amplitudeModifiers": [
                        {
                            "type": "Type of amplitude modifier (e.g., constant, ramp)",
                            "value": "Value for constant type",
                            "startValue": "Start value for ramp type",
                            "endValue": "End value for ramp type"
                        }
                    ]
                }
            },
            "Brake": {
                "spwm": {
                    // Same fields as in Acceleration
                }
            },
            "Neutral": {
                "spwm": {
                    // Same fields as in Acceleration
                }
            },
            "AccelerationBrakeNeutral": {
                "spwm": {
                    // Same fields as in Acceleration
                }
            }
        }
        // More speed ranges...
    ]
}
```

---

## Fields Explained

### Top-Level Fields

| Field                 | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `name`                | The name of the configuration (e.g., "BART Legacy Fleet").                  |
| `manufacturer`        | The manufacturer of the train or system (e.g., "ADTRANZ").                  |
| `date`                | The date of the configuration (e.g., "2024-12-27").                         |
| `description`         | A description of the configuration (optional).                              |
| `maxAcceleration_kmh_s` | The maximum acceleration of the train in km/h/s.                          |
| `motorGearRatio`      | The gear ratio of the motor.                                                |
| `maxSpeed_kmh`        | The maximum speed of the train in km/h.                                     |
| `speedRanges`         | An array of speed ranges, each defining behavior for a specific speed range.|

---

### Speed Range Fields

Each object in the `speedRanges` array defines the behavior for a specific speed range. The fields are:

| Field                 | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `minSpeed`            | The minimum speed for this range (inclusive).                               |
| `maxSpeed`            | The maximum speed for this range (exclusive).                               |
| `Acceleration`        | Configuration for when the train is accelerating.                           |
| `Brake`               | Configuration for when the train is braking.                                |
| `Neutral`             | Configuration for when the train is in neutral.                             |
| `AccelerationBrakeNeutral` | Fallback configuration if specific modes are not defined.               |

---

### SPWM Configuration

The `spwm` object defines the behavior of the Sinusoidal Pulse Width Modulation (SPWM) for a specific mode. The fields are:

| Field                 | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `type`                | The type of SPWM (`fixed`, `ramp`, or `sync`).                              |
| `carrierFrequency`    | The carrier frequency for `fixed` type.                                     |
| `minCarrierFrequency` | The minimum carrier frequency for `ramp` type.                              |
| `maxCarrierFrequency` | The maximum carrier frequency for `ramp` type.                              |
| `pulseMode`           | The pulse mode for `sync` type (e.g., 1, 3, 7, 11).                         |
| `widePulse`           | Boolean indicating if wide pulse mode is enabled.                           |
| `modulationIndex`     | The modulation index for wide pulse mode.                                   |
| `amplitudeModifiers`  | An array of amplitude modifiers to adjust the amplitude of the signal.      |

---

### Amplitude Modifiers

Amplitude modifiers adjust the amplitude of the signal based on the speed or other factors. Each modifier has the following fields:

| Field                 | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `type`                | The type of modifier (`constant` or `ramp`).                                |
| `value`               | The value for `constant` type.                                              |
| `startValue`          | The start value for `ramp` type.                                            |
| `endValue`            | The end value for `ramp` type.                                              |

---

## Example Configuration

Here’s an example configuration for a train:

```json
{
    "name": "BART Legacy Fleet (A/B Cars)",
    "manufacturer": "ADTRANZ",
    "date": "2024-12-27",
    "description": "Configuration for the BART Legacy Fleet A/B Cars.",
    "maxAcceleration_kmh_s": "3",
    "motorGearRatio": 1,
    "maxSpeed_kmh": 130,
    "speedRanges": [
        {
            "minSpeed": -1,
            "maxSpeed": 5,
            "AccelerationBrakeNeutral": {
                "spwm": {
                    "type": "ramp",
                    "minCarrierFrequency": 250,
                    "maxCarrierFrequency": 500,
                    "amplitudeModifiers": [
                        {
                            "type": "ramp",
                            "startValue": 0.5,
                            "endValue": 1.0
                        }
                    ]
                }
            }
        },
        {
            "minSpeed": 5,
            "maxSpeed": 20,
            "Acceleration": {
                "spwm": {
                    "type": "fixed",
                    "carrierFrequency": 500
                }
            },
            "Brake": {
                "spwm": {
                    "type": "fixed",
                    "carrierFrequency": 300
                }
            },
            "Neutral": {
                "spwm": {
                    "type": "fixed",
                    "carrierFrequency": 400
                }
            }
        }
        // More speed ranges...
    ]
}
```

