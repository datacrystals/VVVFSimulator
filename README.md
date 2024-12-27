# Train Inverter Sound Simulator

The **Train Inverter Sound Simulator** is a JavaScript-based project that simulates the sound of a train's inverter based on its speed, acceleration, and braking. It uses a configurable JSON file to define the behavior of the sound generator at different speed ranges and modes (Acceleration, Brake, Neutral). The project is designed to be modular, extensible, and easy to customize.

In the future, this project will support **VESC (Vedder Electronic Speed Controller)** with firmware 6.05+, allowing configurations created here to be pushed onto a VESC. This will enable Personal Electric Vehicles (PEVs) to generate sounds like VVVF (Variable Voltage Variable Frequency) inverters based on the configurations defined in this software. **Note: VESC support is not yet implemented but is planned for a future release.**

---

## Features

- **Configurable Inverter Sound Generation**: Define different sound behaviors for various speed ranges and modes (Acceleration, Brake, Neutral).
- **SPWM (Sinusoidal Pulse Width Modulation)**: Supports fixed, ramp, and sync SPWM types for realistic inverter sound generation.
- **Amplitude Modifiers**: Adjust the amplitude of the sound signal using constant or ramp modifiers.
- **Real-Time Simulation**: Simulates inverter sounds in real-time based on speed changes.
- **Oscilloscope Visualization**: Visualize the sound, command, and carrier signals using an oscilloscope display.
- **Speedometer and Tractive Effort Bar**: Display the train's speed and tractive effort in real-time.
- **Future VESC Support**: Configurations created in this software will be compatible with VESC firmware 6.05+, enabling PEVs to generate VVVF inverter sounds based on these configurations. (**Not yet implemented**)

---

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- Basic knowledge of JavaScript and JSON.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/train-sound-simulator.git
   cd train-sound-simulator
   ```

2. **Open the Project**:
   - Open the `index.html` file in your web browser to run the simulator.

3. **Modify the Configuration**:
   - Edit the JSON configuration files in the `Configurations` folder to customize the sound behavior.

---


## Configuration

The behavior of the sound generator is defined in JSON configuration files. Each configuration file specifies the sound behavior for different speed ranges and modes. Refer to the [Configuration Documentation](Configurations/README.md) for details on how to create and modify configuration files.

### Example Configuration

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
        }
        // More speed ranges...
    ]
}
```

---

## Usage

1. **Open the Simulator**:
   - Open `index.html` in your web browser.

2. **Select a Configuration**:
   - Use the dropdown menu to select a configuration file.

3. **Control the Train**:
   - Use the buttons to set the power level, neutral, or braking level.
   - Adjust the volume using the volume slider.

4. **View the Output**:
   - The oscilloscope displays the sound, command, and carrier signals.
   - The speedometer and tractive effort bar show the train's speed and tractive effort in real-time.

---

## Customization

### Adding New Configurations

1. Create a new JSON file in the `Configurations` folder.
2. Define the sound behavior for different speed ranges and modes.
3. Add the new configuration to the `Manifest.json` file.

### Modifying the Code

- **Sound Generation**: Modify `generator.js` to change how sound samples are generated.
- **Audio Playback**: Modify `audioPlayer.js` to change how audio is processed and played.
- **Visualization**: Modify `display.js` to change how the oscilloscope and other visual elements are rendered.

---


## Future VESC Support

In the future, this project will support **VESC (Vedder Electronic Speed Controller)** with firmware 6.05+. This will allow configurations created in this software to be pushed onto a VESC, enabling Personal Electric Vehicles (PEVs) to generate sounds like VVVF inverters based on the configurations defined here. **Note: VESC support is not yet implemented but is planned for a future release.**

---

## Call for Contributions

We welcome contributions for especially **new traction inverter configurations** (but all contributions are welcome)! If you have configurations for other trains or traction inverters, please submit a pull request (PR) with your JSON configuration files. Your contributions will help expand the library of available sounds and make this project more versatile.

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the AGPLV3 License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments

- **ADTRANZ**: For the inspiration and reference configurations.
- **Web Audio API**: For providing the tools to generate and manipulate audio in the browser.

---

## Contact

For questions or feedback, please send an email [here](https://tliao.net/Contact/Contact/).
