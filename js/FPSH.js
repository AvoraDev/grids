export const FPSH = {
    input: {},
    confirm: {},
    frameStart: new Date(),
    frameEnd: new Date(),
    samples: [],
    sampleSize: 25,
    log: function() {
        this.frameEnd = new Date();
        this.samples.push(1000 / (this.frameEnd.getTime() - this.frameStart.getTime()));
        if (this.samples.length >= this.sampleSize) {this.samples.shift();}
        this.frameStart = this.frameEnd;
    },
    getFps: function() {
        let output = 0;
        this.samples.forEach(sample => {
            output += sample;
        });

        return output / this.samples.length;
    }
}