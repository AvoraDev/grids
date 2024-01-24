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
    /**
     * Find position and size of all cells.
     * @returns {void}
     */
    updateCells() {
        // clear all cells
        this.cells = [];

        // get width and height of each cell
        let width = (this.canvas.width - (this.border.margin * 2)) / this.columns;
        let height = (this.canvas.height - (this.border.margin * 2)) / this.rows;

        // for each row:
        for (let i = 0; i < this.rows; i++) {
            // for each column:
            for (let j = 0; j < this.columns; j++) {
                // get position to start draw
                let x = 0 + (width * j) + (this.border.margin);
                let y = 0 + (height * i) + (this.border.margin);
                
                // set cells arr
                this.cells.push([x, y, width, height]);
            }
        }
    },
    /**
     * Draw all cells to canvas.
     * @returns {void}
     */
    draw() {
        // keep track of old line width to revert back to it later
        let oldLineWidth = this.ctx.lineWidth;

        // set color and size
        this.ctx.strokeStyle = this.border.color;
        this.ctx.lineWidth = this.border.size;

        // for debug text
        if (this.debug === true) {
            this.ctx.fillStyle = this.border.color;
            this.ctx.textAlign = "center";
            this.ctx.font = `${this.cells[0][2] / 7}px Ariel`
        }

        // draw all cells
        for (let i = 0; i < this.cells.length; i++) {
            this.ctx.strokeRect(
                this.cells[i][0],
                this.cells[i][1],
                this.cells[i][2],
                this.cells[i][3]
            );

            if (this.debug === true) {
                this.ctx.fillText(
                    i,
                    this.cells[i][0] + (this.cells[i][2] / 2),
                    this.cells[i][1] + (this.cells[i][3] / 2)
                );
            }
        }

        // revert line width
        this.ctx.lineWidth = oldLineWidth;
    },
    /**
     * Check to see if given coordinates is within any cell. Returns -1 if it isn't.
     * @param {number} x
     * @param {number} y
     * @param {boolean} fullReturn - If set to true, will return an array with the id, column, and row.
     * @returns {number}
     */
    withinCell(x, y, fullReturn = false) {
        let col = Math.floor(x / (this.cells[0][2] + this.border.margin));
        let row = Math.floor(y / (this.cells[0][3] + this.border.margin));

        // if the coords are out of the grid's bounds:
        if (col > this.col || col < 0 || row > this.row || row < 0) {return -1;}

        if (fullReturn === false) {
            return col + (row * this.columns);
        } else {
            return [col + (row * this.columns), col, row];
        }
    }
};