export const Griddy = {
    canvas: {},
    ctx: {},
    rows: 8,
    columns: 8,
    border: {
        size: 2,
        margin: 0,
        color: "rgb(255, 255, 255)"
    },
    debug: false,
    cells: [],
    draw() {
        // get width and height of each cell
        let width = (this.canvas.width - (this.border.margin * 2)) / this.columns;
        let height = (this.canvas.height - (this.border.margin * 2)) / this.rows;
        
        // keep track of old line width to revert back to it later
        let oldLineWidth = this.ctx.lineWidth;

        // draw all cells
        this.ctx.strokeStyle = this.border.color;
        this.ctx.lineWidth = this.border.size;

        if (this.debug === true) {
            this.ctx.fillStyle = this.border.color;
            this.ctx.textAlign = "center";
            this.ctx.font = "20px Ariel"
        }

        // for each row:
        for (let i = 0; i < this.rows; i++) {

            // for each column:
            for (let j = 0; j < this.columns; j++) {
                // get position to start draw
                let x = 0 + (width * j) + (this.border.margin);
                let y = 0 + (height * i) + (this.border.margin);
                
                // draw
                this.ctx.strokeRect(x, y, width, height);

                if (this.debug === true) {
                    this.ctx.fillText((i * this.columns) + j, x + (width / 2), y + (height / 2));
                }

                // set cells arr
                // first item is id (might not be used)
                this.cells[(i * this.columns) + j] = [x, y, width, height];
            }
        }

        // revert line width
        this.ctx.lineWidth = oldLineWidth;
    },
    update() {
        this.draw();
    },
    // todo - name
    // todo - make this search better
    withinCell(x, y) {
        let xHit = false;
        let yHit = false;
        for (let i = 0; i < this.cells.length; i++) {
            if (x >= this.cells[i][0] && x <= this.cells[i][0] + this.cells[i][2]) {
                // xHit = true;
            } else {
                continue;
            }
            if (y >= this.cells[i][1] && y <= this.cells[i][1] + this.cells[i][3]) {
                // yHit = true;
            } else {
                continue;
            }

            return i;
            // if (xHit === true && yHit === false) {

            // } else if (xHit === false && yHit === true) {

            // } else {
            //     return i;
            // }
        }

        // if nothing is found
        return "Not found";
    }
};