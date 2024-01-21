// !!! IMPORTANT NOTE !!!
// you need to decide if you want to keep adding functions for resizing
// its getting annoying

// module imports
import { Hoot } from "./Hoot.js";
import { Griddy } from "./Griddy.js";
import { StdEntity } from "./StdEntity.js";
import { NPC } from "./NPC.js";
import { FPSH } from "./FPSH.js";

// HTML elements
const debug_text = document.querySelector("#debug-text");

// canvas setup
const disp = new Hoot(document.querySelector("#disp"), "rgb(0, 0, 0)");

// grid setup
Griddy.canvas = disp;
Griddy.ctx = disp.ctx;
Griddy.border.margin = 25;

// FPSH setup
FPSH.input = document.querySelector("#fps-input");
FPSH.confirm = document.querySelector("#fps-confirm");

// StdEntity setup
StdEntity.ctx = disp.ctx;
StdEntity.resizeDrawSpace(0, 0, disp.width, disp.height, 25);
window.addEventListener("resize", () => {
    StdEntity.resizeDrawSpace(0, 0, disp.width, disp.height, 25);
});

// test entity setup
const test = new StdEntity(
	disp.width / 2,
    disp.height / 2,
    {
        color: "rgb(255, 0, 0)",
        shape: "circle",
        size: 20
    },
    {
        direction: {
            x: 0,
            y: 0
        },
        speed: {
            min: 0,
            max: 10,
            acceleration: 30/60 // note: acceleration is changed per frame
        }
    }
);
test.initEventListeners();

// bullets WIP
test.NPCs = [];
test.shootCooldown = new Date();
test.addKeybind("shoot", "Space", {
    enabled: () => {
        let currentTime = new Date();
        if (currentTime.getTime() - test.shootCooldown.getTime() > 100) {
            test.NPCs.push(new NPC(
                test.x,
                test.y,
                {
                    color: "rgb(0, 255, 255)",
                    shape: "circle",
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
    },
    disabled: () => {
        test._inputConfig.shoot.flag.keyup = false;
    }
});

// debugging mess
let cellDebug = false;
let txtDebug = false;
function debug(txt = false, cell = false, tru = "rgb(0, 255, 0)", fal = "rgb(255, 0, 0)") {
    if (txt === true) {
        // wish this didn't have to be hand written
        try {
            debug_text.innerHTML = `
            FPS: ${FPSH.getFps().toFixed(2)}<br>
            x: ${test.x.toFixed(2)}<br>
            y: ${test.y.toFixed(2)}<br>
            dX: ${test.direction.x.toFixed(2)}<br>
            dY: ${test.direction.y.toFixed(2)}<br>
            angle: ${(Math.atan2(test.direction.y, test.direction.x) * (180 / Math.PI)).toFixed(2)}&deg;<br>
            speed: ${test.speed.current}<br>
            magnitude: ${test.direction.magnitude().toFixed(2)}<br>
            <br>
            Flags:<br>
            up:<br>
            - down: <span style="color:${test._inputConfig.up.flag.keydown ? tru : fal}">${test._inputConfig.up.flag.keydown}</span><br>
            - up: <span style="color:${test._inputConfig.up.flag.keyup ? tru : fal}">${test._inputConfig.up.flag.keyup}</span><br>
            down:<br>
            - down: <span style="color:${test._inputConfig.down.flag.keydown ? tru : fal}">${test._inputConfig.down.flag.keydown}</span><br>
            - up: <span style="color:${test._inputConfig.down.flag.keyup ? tru : fal}">${test._inputConfig.down.flag.keyup}</span><br>
            left:<br>
            - down: <span style="color:${test._inputConfig.left.flag.keydown ? tru : fal}">${test._inputConfig.left.flag.keydown}</span><br>
            - up: <span style="color:${test._inputConfig.left.flag.keyup ? tru : fal}">${test._inputConfig.left.flag.keyup}</span><br>
            right:<br>
            - down: <span style="color:${test._inputConfig.right.flag.keydown ? tru : fal}">${test._inputConfig.right.flag.keydown}</span><br>
            - up: <span style="color:${test._inputConfig.right.flag.keyup ? tru : fal}">${test._inputConfig.right.flag.keyup}</span><br>
            shoot:<br>
            - down: <span style="color:${test._inputConfig.shoot.flag.keydown ? tru : fal}">${test._inputConfig.shoot.flag.keydown}</span><br>
            - up: <span style="color:${test._inputConfig.shoot.flag.keyup ? tru : fal}">${test._inputConfig.shoot.flag.keyup}</span><br>
            <br>
            NPCs: ${test.NPCs.length}
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

    // highlight cell
    if (cell === true) {
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
function init(fps = 60) {
    // clear previous interval
    clearInterval(anim);

    // start new one with given fps
    // todo - speed changes with fps, fix it with another interval or some other solution
    anim = setInterval(() => {
        // clean screen
        disp.clear();
        
        // debugging
        debug(txtDebug, cellDebug, "rgb(0, 255, 255)", "rgb(255, 150, 100)")

        // update grid
        Griddy.update();

        // update stuff
        test.update();
        
        // npc jazz
        for (let i = 0; i < test.NPCs.length; i++) {
            test.NPCs[i].update();
        }

        // log fps sample
        FPSH.log();
    }, 1000 / fps);

    // log init
    console.log(`Init with ${fps} FPS set`);
}

// begin (lol)
// ------------------------------------------------------------
// ------------------------------------------------------------

                        init(60);

// ------------------------------------------------------------
// ------------------------------------------------------------

// misc
FPSH.confirm.onclick = () => {init(FPSH.input.value);}

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
            txtDebug = !txtDebug;
            break;
        
        case "KeyL":
            cellDebug = !cellDebug;
            break;
        
        case "KeyJ":
            // basic toggle, don't feel the need to keep a global variable for it
            toggleHTMLDisplay("#keybind-menu", "block", "none");
            break;
        
        case "KeyM":
            test.debug = !test.debug;
        default:
            break;
    }
});