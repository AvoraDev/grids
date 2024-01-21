export class LPSH {
    constructor(input, confirm, sampleSize) {
        this.input = document.querySelector(input);
        this.confirm = document.querySelector(confirm);
        this.frameStart = new Date();
        this.frameEnd = new Date();
        this.samples = [];
        this.sampleSize = sampleSize;
    }
    log() {
        this.frameEnd = new Date();
        this.samples.push(1000 / (this.frameEnd.getTime() - this.frameStart.getTime()));
        if (this.samples.length >= this.sampleSize) {this.samples.shift();}
        this.frameStart = this.frameEnd;
    }
    getLPS() {
        let output = 0;
        this.samples.forEach(sample => {
            output += sample;
        });

        return output / this.samples.length;
    }
}