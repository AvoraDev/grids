export class LPSH {
    /**
     * Create instance of LPSH
     * @param {HTMLInputElement} input
     * @param {HTMLButtonElement} confirm
     * @param {number} sampleSize
     * @returns {object}
     */
    constructor(input, confirm, sampleSize) {
        this.input = document.querySelector(input);
        this.confirm = document.querySelector(confirm);
        this.logStart = new Date();
        this.logEnd = new Date();
        this.samples = [];
        this.sampleSize = sampleSize;
    }
    /**
     * Record a sample of time since the last log in milliseconds.
     * @returns {void}
     */
    log() {
        this.logEnd = new Date();
        this.samples.push(1000 / (this.logEnd.getTime() - this.logStart.getTime()));
        if (this.samples.length >= this.sampleSize) {this.samples.shift();}
        this.logStart = this.logEnd;
    }
    /**
     * Get average time between logs in milliseconds.
     * @returns {void}
     */
    getLPS() {
        let output = 0;
        this.samples.forEach(sample => {
            output += sample;
        });

        return output / this.samples.length;
    }
    /**
     * Delete all recorded samples.
     * @returns {void}
     */
    clearSamples() {
        this.samples = [];
    }
}