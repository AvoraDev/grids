export class Hoot {
    constructor(canvas, color = "rgb(0, 0, 0)") {
        this.canvas = canvas;
        this.color = color;
        this.ctx = canvas.getContext("2d");

        // setup auto-resize;
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.clear();
    }
    clear() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    get width() {return this.canvas.width;}
    get height() {return this.canvas.height}
    set width(width) {this.canvas.width = width;}
    set height(height) {this.canvas.height = height;}
}