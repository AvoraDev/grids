export class Hoot {
    constructor(canvas, color = "rgb(0, 0, 0)") {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.color = color;
        this.ctx = canvas.getContext("2d");

        // setup auto-resize;
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.clear();
    }
    clear() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}