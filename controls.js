class TrainControls {
    constructor(buttons, simulator) {
        this.buttons = buttons;
        this.simulator = simulator;
        this.currentSelection = 'n';
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    highlightButton(buttonId) {
        for (const id in this.buttons) {
            this.buttons[id].classList.remove('active-power', 'active-neutral', 'active-braking', 'active-power-prev', 'active-braking-prev');
        }
        if (buttonId.startsWith('p')) {
            for (let i = 1; i <= parseInt(buttonId.slice(1)); i++) {
                this.buttons[`p${i}`].classList.add('active-power-prev');
            }
            this.buttons[buttonId].classList.add('active-power');
        } else if (buttonId === 'n') {
            this.buttons[buttonId].classList.add('active-neutral');
        } else if (buttonId.startsWith('b')) {
            for (let i = 1; i <= parseInt(buttonId.slice(1)); i++) {
                this.buttons[`b${i}`].classList.add('active-braking-prev');
            }
            this.buttons[buttonId].classList.add('active-braking');
        }
    }

    setPower(level) {
        this.simulator.setPower(level);
        this.currentSelection = `p${level}`;
        this.highlightButton(this.currentSelection);
    }

    setNeutral() {
        this.simulator.setNeutral();
        this.currentSelection = 'n';
        this.highlightButton(this.currentSelection);
    }

    setBraking(level) {
        this.simulator.setBraking(level);
        this.currentSelection = `b${level}`;
        this.highlightButton(this.currentSelection);
    }

    handleKeyPress(event) {
        if (event.key === 'w') {
            if (this.currentSelection === 'n') {
                this.setPower(1);
            } else if (this.currentSelection.startsWith('p')) {
                const level = parseInt(this.currentSelection.slice(1));
                if (level < 3) {
                    this.setPower(level + 1);
                }
            } else if (this.currentSelection.startsWith('b')) {
                const level = parseInt(this.currentSelection.slice(1));
                if (level > 1) {
                    this.setBraking(level - 1);
                } else {
                    this.setNeutral();
                }
            }
        } else if (event.key === 's') {
            if (this.currentSelection === 'n') {
                this.setBraking(1);
            } else if (this.currentSelection.startsWith('b')) {
                const level = parseInt(this.currentSelection.slice(1));
                if (level < 5) {
                    this.setBraking(level + 1);
                }
            } else if (this.currentSelection.startsWith('p')) {
                const level = parseInt(this.currentSelection.slice(1));
                if (level > 1) {
                    this.setPower(level - 1);
                } else {
                    this.setNeutral();
                }
            }
        }
    }
}

export default TrainControls;