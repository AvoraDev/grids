// ------------------------------------------------------------------------
// SETUP
// ------------------------------------------------------------------------

// module imports
import { Hoot }         from "./Hoot.js";
import { Griddy }       from "./Griddy.js";
import { LPSH }         from "./LPSH.js";
import { StdEntity }    from "./StdEntity.js";
import { NPC }          from "./NPC.js";
import { addShooting }  from "./Shoot.js";

// from https://stackoverflow.com/questions/41227019/how-to-detect-if-a-web-page-is-running-from-a-website-or-local-file-system
switch(window.location.protocol) {
    case 'http:': // never thought about doing this, its cool
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
const disp = new Hoot("#disp", "rgb(0, 0, 0)");

// grid setup
Griddy.canvas = disp;
Griddy.ctx = disp.ctx;
Griddy.border.margin = 5;
Griddy.border.color = "rgb(200, 215, 210)";
Griddy.UpdateCells();
window.addEventListener("resize", () => {
    Griddy.UpdateCells();
});

// FPSH and TPSH setup
const FPSH = new LPSH("#fps-input", "#fps-confirm");
const TPSH = new LPSH("#tps-input", "#tps-confirm");

// StdEntity setup
StdEntity.ctx = disp.ctx;
StdEntity.ResizeDrawSpace(0, 0, disp.width, disp.height, Griddy.border.margin);
window.addEventListener("resize", () => {
    StdEntity.ResizeDrawSpace(0, 0, disp.width, disp.height, Griddy.border.margin);
});

// test entity setup
const allMass = 1;
const test = new StdEntity(
	disp.width / 2,
    disp.height / 2,
    allMass,
    {
        color: "rgb(255, 0, 0)",
        shape: "triangle",
        width: 20,
        zDepth: 1
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

// shooting WIP
addShooting(test, 'rgb(0, 255, 255)');
test.secondaryGraphics.push(() => {
    let oldWidth = StdEntity.ctx.lineWidth;

    StdEntity.ctx.beginPath();
    StdEntity.ctx.arc(test.x, test.y, test.width * 1.5, 0, Math.PI * 2);
    StdEntity.ctx.strokeStyle = 'rgb(255, 255, 255)';
    StdEntity.ctx.lineWidth = 4;
    StdEntity.ctx.stroke();

    StdEntity.ctx.lineWidth = oldWidth;
})

// test NPC setup
const colTest = new NPC(
    (disp.width / 2) + 50,
    disp.height / 2,
    allMass,
    {
        color: "rgb(0, 255, 150)",
        shape: "circle",
        width: 40,
        zDepth: -1
    },
    {
        direction: -45,
        speed: {
            min: 5,
            max: 5
        }
    }
)
colTest.collisionRebound = true;

// ------------------------------------------------------------------------
// DEBUG
// ------------------------------------------------------------------------

// debugging mess
let cellsDebugFlag = false;
let txtDebugFlag = false;
function debugTxt(flag = false, tru = "rgb(0, 255, 0)", fal = "rgb(255, 0, 0)") {
    if (flag === true) {
        // wish this didn't have to be hand written
        try {
            let angle = Math.atan2(test.direction.y, test.direction.x) * (180 / Math.PI)
            angle = (angle < 0) ? 360 + angle : angle;

            debug_text.innerHTML = `
            FPS: ${FPSH.GetLPS().toFixed(2)}<br>
            TPS: ${TPSH.GetLPS().toFixed(2)}<br>
            x: ${test.x.toFixed(2)}<br>
            y: ${test.y.toFixed(2)}<br>
            dX: ${test.direction.x.toFixed(2)}<br>
            dY: ${test.direction.y.toFixed(2)}<br>
            angle: ${angle.toFixed(2)}&deg;<br>
            speed: ${test.speed.current.toFixed(2)}<br>
            magnitude: ${test.dirMagnitude.toFixed(2)}<br>
            <br>
            Flags:<br>
            - up: <span style="color:${test._inputConfig.up.flag ? tru : fal}">${test._inputConfig.up.flag}</span><br>
            - down: <span style="color:${test._inputConfig.down.flag ? tru : fal}">${test._inputConfig.down.flag}</span><br>
            - left: <span style="color:${test._inputConfig.left.flag ? tru : fal}">${test._inputConfig.left.flag}</span><br>
            - right: <span style="color:${test._inputConfig.right.flag ? tru : fal}">${test._inputConfig.right.flag}</span><br>
            - iF: <span style="color:${test.invincibility ? tru : fal}">${test.invincibility}</span><br>
            - shoot: <span style="color:${test._inputConfig.shoot.flag ? tru : fal}">${test._inputConfig.shoot.flag}</span><br>
            <br>
            NPCs: ${test._shooting.bullets.length}<br>
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
        let gridId = Griddy.WithinCell(test.x, test.y);
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

// ------------------------------------------------------------------------
// RUNTIME FUNCTIONS
// ------------------------------------------------------------------------

let anim;
let calc;
function _initDraw(fps) {
    // clear previous interval
    clearInterval(anim);

    // start new one with given fps
    // note: order matters here
    anim = setInterval(() => {
        // clean screen
        disp.Clear();
        
        // debug
        debugCells(cellsDebugFlag);

        // draw grid
        Griddy.Draw();
        Griddy.FillMargin();

        // draw test entities
        StdEntity.DrawAll();

        // debugging
        FPSH.Log();
    }, 1000 / fps);

    // log init
    console.log(`Init with ${fps} FPS set`);
}
function _initCalc(tps) { // ticks per second
    // clear previous interval
    clearInterval(calc);

    // start new one with given tps
    calc = setInterval(() => {
        // update stuff
        StdEntity.UpdateAll();

        // debugging
        debugTxt(txtDebugFlag, "rgb(0, 255, 255)", "rgb(255, 150, 100)")
        TPSH.Log();
    }, 1000 / tps);

    // log init
    console.log(`Init with ${tps} TPS set`);
}
function init(fps = 60, tps = 60) {
    // begin jazz
    _initDraw(fps);
    _initCalc(tps);
}

// *
    // **
        // ***
            // ****
                init(60, 60);
            // ****
        // ***
    // **
// *

// ------------------------------------------------------------------------
// FPS/TPS CONTROL
// ------------------------------------------------------------------------

FPSH.confirm.onclick = () => {
    _initDraw(FPSH.input.value);
    FPSH.ClearSamples();
};
TPSH.confirm.onclick = () => {
    _initCalc(TPSH.input.value);
    TPSH.ClearSamples();
};
document.querySelector("#grid-rows-confirm").onclick = () => {
    Griddy.rows = document.querySelector("#grid-rows-input").value;
    Griddy.UpdateCells();
};
document.querySelector("#grid-columns-confirm").onclick = () => {
    Griddy.columns = document.querySelector("#grid-columns-input").value;
    Griddy.UpdateCells()
};

// ------------------------------------------------------------------------
// HTML CONTROL + KEYBINDS
// ------------------------------------------------------------------------

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
            for (let i = 0; i < StdEntity.entities.length; i++) {
                StdEntity.entities[i].debug = !StdEntity.entities[i].debug;
            }
            break;
        
        case "KeyN":
            toggleHTMLDisplay("#variable-menu", "none", "block");
            break;
        
        default:
            break;
    }
});