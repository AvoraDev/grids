// module imports
import { Hoot } from "./Hoot.js";
import { StdEntity } from "./StdEntity.js";
import { NPC } from "./NPC.js";
import { FPSH } from "./FPSH.js";

// HTML elements
const debug_text = document.querySelector("#debug-text"); // first child

// canvas setup
const disp = new Hoot(
    document.querySelector("#disp"),
    "rgb(0, 0, 0)"
);

// FPSH setup
FPSH.input = document.querySelector("#fps-input");
FPSH.confirm = document.querySelector("#fps-confirm");

// test entity setup
StdEntity.ctx = disp.ctx;
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
            acceleration: 30/60 // acceleration is changed per frame
        }
    }
);
test.debug = true;
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
            test.shootCooldown = new Date();
        }
    },
    disabled: () => {
        test._inputObj.shoot.flag.keyup = false;
    }
});

let anim;
let fal = "rgb(255, 150, 100)";
let tru = "rgb(0, 255, 255";
function init(fps = 60) {
    // clear previous interval
    clearInterval(anim);

    // start new one with given fps
    // todo - speed changes with fps, fix it with another interval or some other solution
    anim = setInterval(() => {
        // clean screen
        disp.clear();
            
        // update stuff
        test.update();
        
        // npc jazz
        for (let i = 0; i < test.NPCs.length; i++) {
            test.NPCs[i].update();
        }

        // collision detection
        if (test.x < 0 || test.x > disp.width - test.size.width) {
            test.direction.x = -test.direction.x;
            if (test.x < 0) {
                test.x = 0; // + test.size.width;
            } else {
                test.x = disp.width - test.size.width;
            }
        }
        if (test.y < 0 || test.y > disp.height - test.size.height) {
            test.direction.y = -test.direction.y;
            if (test.y < 0) {
                test.y = 0; // + test.size.height;
            } else {
                test.y = disp.height - test.size.height;
            }
        }
        
        // debugging
        // wish this didn't have to be hand written
        FPSH.log();
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
            acceleration: ${test.speed.acceleration}<br>
            <br>
            Flags:<br>
            up:<br>
            - down: <span style="color:${test._inputObj.up.flag.keydown ? tru : fal}">${test._inputObj.up.flag.keydown}</span><br>
            - up: <span style="color:${test._inputObj.up.flag.keyup ? tru : fal}">${test._inputObj.up.flag.keyup}</span><br>
            down:<br>
            - down: <span style="color:${test._inputObj.down.flag.keydown ? tru : fal}">${test._inputObj.down.flag.keydown}</span><br>
            - up: <span style="color:${test._inputObj.down.flag.keyup ? tru : fal}">${test._inputObj.down.flag.keyup}</span><br>
            left:<br>
            - down: <span style="color:${test._inputObj.left.flag.keydown ? tru : fal}">${test._inputObj.left.flag.keydown}</span><br>
            - up: <span style="color:${test._inputObj.left.flag.keyup ? tru : fal}">${test._inputObj.left.flag.keyup}</span><br>
            right:<br>
            - down: <span style="color:${test._inputObj.right.flag.keydown ? tru : fal}">${test._inputObj.right.flag.keydown}</span><br>
            - up: <span style="color:${test._inputObj.right.flag.keyup ? tru : fal}">${test._inputObj.right.flag.keyup}</span><br>
            shoot:<br>
            - down: <span style="color:${test._inputObj.shoot.flag.keydown ? tru : fal}">${test._inputObj.shoot.flag.keydown}</span><br>
            - up: <span style="color:${test._inputObj.shoot.flag.keyup ? tru : fal}">${test._inputObj.shoot.flag.keyup}</span><br>
            <br>
            NPCs: ${test.NPCs.length}
            `;
        }
        catch(err) {
            debug_text.innerHTML = "X ~ X";
            console.log("debug broke");
            console.log(err);
        }
    }, 1000 / fps);
}

// this is all the way down here to prevent hoisting
FPSH.confirm.onclick = function() {
    init(FPSH.input.value);
    console.log(`Init with ${FPSH.input.value} FPS set`);
}

// begin (lol)
// ------------------------------------------------------------
// ------------------------------------------------------------

                        init(60);

// ------------------------------------------------------------
// ------------------------------------------------------------