// module imports
import { Hoot } from "./Hoot.js";
import { Griddy } from "./Griddy.js";
import { StdEntity } from "./StdEntity.js";
import { NPC } from "./NPC.js";
import { LPSH } from "./LPSH.js";

// :D (from https://stackoverflow.com/questions/41227019/how-to-detect-if-a-web-page-is-running-from-a-website-or-local-file-system)
switch(window.location.protocol) {
    case 'http:':
    case 'https:':
        document.title += ": remote";
        break;
    case 'file:':
        document.title += ": local";
        break;
        default: 
        document.title += ": ?";
}

// HTML elements
const debug_text = document.querySelector("#debug-text");

// canvas setup
const disp = new Hoot(document.querySelector("#disp"), "rgb(0, 0, 0)");

// grid setup
Griddy.canvas = disp;
Griddy.ctx = disp.ctx;
Griddy.border.margin = 5;
Griddy.border.color = "rgb(200, 215, 210)";
Griddy.updateCells();
window.addEventListener("resize", () => {
    Griddy.updateCells();
});

// FPSH and TPSH setup
const FPSH = new LPSH("#fps-input", "#fps-confirm");
const TPSH = new LPSH("#tps-input", "#tps-confirm");

// StdEntity setup
StdEntity.ctx = disp.ctx;
StdEntity.resizeDrawSpace(0, 0, disp.width, disp.height, Griddy.border.margin);
window.addEventListener("resize", () => {
    StdEntity.resizeDrawSpace(0, 0, disp.width, disp.height, Griddy.border.margin);
});

// test entity setup
const test = new StdEntity(
	disp.width / 2,
    disp.height / 2,
    {
        color: "rgb(255, 0, 0)",
        shape: "triangle",
        size: 20
    },
    {
        direction: {
            x: 0,
            y: 0
        },
        speed: {
            min: 0,
            max: 7,
            acceleration: 4
        }
    }
);
test.initEventListeners();

// test NPC setup
const colTest = new NPC(
    disp.width / 2,
    disp.height / 2,
    {
        color: "rgb(0, 255, 150)",
        shape: "circle",
        size: 40
    },
    {
        direction: 45,
        speed: {
            min: 5,
            max: 5
        }
    }
)
colTest.collisionConfig.rebound = true;

// bullets WIP
test.NPCs = [];
test.shootCooldown = new Date();
test.addKeybind("shoot", "Space", () => {
    let currentTime = new Date();
    if (currentTime.getTime() - test.shootCooldown.getTime() > 100) {
        test.NPCs.push(new NPC(
            test.x,
            test.y,
            {
                color: "rgb(0, 255, 255)",
                shape: "triangle",
                size: test.size.width * 0.75
            },
            {
                direction: {
                    x: test.direction.x,
                    y: test.direction.y
                },
                speed: {
                    min: test.speed.max * 1.25,
                    max: test.speed.max * 1.25
                }
            }
        ))
        test.NPCs[test.NPCs.length - 1].collisionConfig.rebound = true;
        test.shootCooldown = new Date();
    }
});

// debugging mess
let cellsDebugFlag = false;
let txtDebugFlag = false;
function debugTxt(flag = false, tru = "rgb(0, 255, 0)", fal = "rgb(255, 0, 0)") {
    if (flag === true) {
        // wish this didn't have to be hand written
        try {
            debug_text.innerHTML = `
            FPS: ${FPSH.getLPS().toFixed(2)}<br>
            TPS: ${TPSH.getLPS().toFixed(2)}<br>
            x: ${test.x.toFixed(2)}<br>
            y: ${test.y.toFixed(2)}<br>
            dX: ${test.direction.x.toFixed(2)}<br>
            dY: ${test.direction.y.toFixed(2)}<br>
            angle: ${(Math.atan2(test.direction.y, test.direction.x) * (180 / Math.PI)).toFixed(2)}&deg;<br>
            speed: ${test.speed.current.toFixed(2)}<br>
            magnitude: ${test.direction._magnitude().toFixed(2)}<br>
            <br>
            Flags:<br>
            up: <span style="color:${test._inputConfig.up.flag ? tru : fal}">${test._inputConfig.up.flag}</span><br>
            down: <span style="color:${test._inputConfig.down.flag ? tru : fal}">${test._inputConfig.down.flag}</span><br>
            left: <span style="color:${test._inputConfig.left.flag ? tru : fal}">${test._inputConfig.left.flag}</span><br>
            right: <span style="color:${test._inputConfig.right.flag ? tru : fal}">${test._inputConfig.right.flag}</span><br>
            shoot: <span style="color:${test._inputConfig.shoot.flag ? tru : fal}">${test._inputConfig.shoot.flag}</span><br>
            <br>
            NPCs: ${test.NPCs.length}<br>
            Cells: ${Griddy.cells.length}
            `;
        }
        catch(err) {
            debug_text.innerHTML = "X ~ X";
            console.log("debug broke");
            console.log(err);
        }
    } else {
        debug_text.innerHTML = "";
    }
}
function debugCells(flag = false) {
    // highlight cell
    if (flag === true) {
        let gridId = Griddy.withinCell(test.x, test.y);
        Griddy.debug = true;
        try {
            disp.ctx.fillStyle = "rgb(150, 100, 255)"
            disp.ctx.fillRect(
                Griddy.cells[gridId][0],
                Griddy.cells[gridId][1],
                Griddy.cells[gridId][2],
                Griddy.cells[gridId][3],
            );
        }
        catch(err) {
            console.log("Grid highlight not working, it's expected for this to happen once");
            // console.log(err);
        }
    } else {
        Griddy.debug = false;
    }
}

let anim;
let calc; // todo - name
function initDraw(fps) {
    // clear previous interval
    clearInterval(anim);

    // start new one with given fps
    // note: order matters here
    anim = setInterval(() => {
        // clean screen
        disp.clear();

        // draw border
        disp.ctx.fillStyle = "rgb(255, 255, 255)";
        disp.ctx.fillRect(0, 0, Griddy.border.margin, disp.height);
        disp.ctx.fillRect(disp.width - Griddy.border.margin, 0, Griddy.border.margin, disp.height);
        disp.ctx.fillRect(0, 0, disp.width, Griddy.border.margin)
        disp.ctx.fillRect(0, disp.height - Griddy.border.margin, disp.width, Griddy.border.margin);
        
        // debug
        debugCells(cellsDebugFlag);

        // draw grid
        Griddy.draw();

        // draw test entities
        colTest.draw();
        test.draw();

        // npc jazz
        for (let i = 0; i < test.NPCs.length; i++) {
            test.NPCs[i].draw();
        }

        FPSH.log();
    }, 1000 / fps);

    // log init
    console.log(`Init with ${fps} FPS set`);
}
function initCalc(tps) { // ticks per second
    // clear previous interval
    clearInterval(calc);

    // start new one with given tps
    calc = setInterval(() => {
        // update stuff
        test.update();
        colTest.update();
        for (let i = 0; i < test.NPCs.length; i++) {
            test.NPCs[i].update();
            if (
                    test.NPCs[i].y > colTest.y - (colTest.height / 2) &&    // top
                    test.NPCs[i].y < colTest.y + (colTest.height / 2) &&    // bottom
                    test.NPCs[i].x > colTest.x - (colTest.width / 2) &&     // left
                    test.NPCs[i].x < colTest.x + (colTest.width / 2)        // right
            ) {
                test.NPCs[i].color = "rgb(100, 0, 255)";
                console.log("npc hit")
            } else {
                test.NPCs[i].color = "rgb(0, 255, 255)";
            }
        }

        // check if two points are within a radius of one another
        // left side < x < right side
        // top side < x < bottom side
        if (
                test.y > colTest.y - (colTest.height / 2) &&    // top
                test.y < colTest.y + (colTest.height / 2) &&    // bottom
                test.x > colTest.x - (colTest.width / 2) &&     // left
                test.x < colTest.x + (colTest.width / 2)        // right
            ) {
                test.color = "rgb(100, 0, 255)";
                console.log("test hit")
        } else {
            test.color = "rgb(255, 0, 0)";
        }

        // debugging
        debugTxt(txtDebugFlag, "rgb(0, 255, 255)", "rgb(255, 150, 100)")
        TPSH.log();
    }, 1000 / tps);

    // log init
    console.log(`Init with ${tps} TPS set`);
}
function init(fps = 60, tps = 60) {
    // begin jazz
    initDraw(fps);
    initCalc(tps);

    // log init
    // console.log(`Init with ${fps} FPS and ${tps} TPS set`);
}

// begin (lol)
// ------------------------------------------------------------
// ------------------------------------------------------------

                        init(60, 60);

// ------------------------------------------------------------
// ------------------------------------------------------------

// misc
FPSH.confirm.onclick = () => {FPSH.clearSamples(); initDraw(FPSH.input.value);};
TPSH.confirm.onclick = () => {TPSH.clearSamples(); initCalc(TPSH.input.value);};
document.querySelector("#grid-rows-confirm").onclick = () => {
    Griddy.rows = document.querySelector("#grid-rows-input").value;
    Griddy.updateCells();
};
document.querySelector("#grid-columns-confirm").onclick = () => {
    Griddy.columns = document.querySelector("#grid-columns-input").value;
    Griddy.updateCells()
};

function toggleHTMLDisplay(elem, initialDisplayType, secondaryDisplayType) {
    let e = document.querySelector(elem);
    if (e.style.display === initialDisplayType || e.style.display === "") {
        e.style.display = secondaryDisplayType;
    } else {
        e.style.display = initialDisplayType;
    }
}

window.addEventListener("keypress", e => {
    // console.log(e.code);
    switch (e.code) {
        case "KeyK":
            toggleHTMLDisplay("#debug-menu", "none", "block");
            txtDebugFlag = !txtDebugFlag;
            break;
        
        case "KeyL":
            cellsDebugFlag = !cellsDebugFlag;
            break;
        
        case "KeyJ":
            toggleHTMLDisplay("#keybind-menu", "block", "none");
            break;
        
        case "KeyM":
            test.debug = !test.debug;
            break;
        
        case "KeyN":
            toggleHTMLDisplay("#variable-menu", "none", "block");
            break;
        
        default:
            break;
    }
});