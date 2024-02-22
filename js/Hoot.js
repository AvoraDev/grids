export class Hoot {
    constructor(canvas, color = 'rgb(0, 0, 0)') {
        this.canvas = document.querySelector(canvas);
        this.color = color;
        this.ctx = this.canvas.getContext('2d');

        // setup auto-resize;
        this.Resize();
        window.addEventListener('resize', () => this.Resize());
    }
    Clear() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    Resize() {
        let per = 1;
        let temp = ((window.innerWidth * 9) / 16) * per;
        
        if (temp > window.innerHeight) {
            this.canvas.width = ((window.innerHeight * 16) / 9) * per;
            this.canvas.height = window.innerHeight * per;
        } else {
            this.canvas.width = window.innerWidth * per;
            this.canvas.height = temp;
        }
        this.Clear();
    }
    get width() {return this.canvas.width;}
    get height() {return this.canvas.height}
    set width(width) {this.canvas.width = width;}
    set height(height) {this.canvas.height = height;}
}