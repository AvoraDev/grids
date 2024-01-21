export class StdEntity {
    // canvas context
    static drawSpace = {x: 0, y: 0, width: 0, height: 0};
    static ctx = {};
	constructor(x, y, appearance, mvInfo) {
  	    // unique properties
        this.x = x;
        this.y = y
        this.color = appearance.color;
        this.size = (typeof(appearance.size) === "object") ?
            appearance.size : {
                width: appearance.size,
                height: appearance.size
            };
        this.shape = (appearance.shape != undefined) ? appearance.shape : "rectangle";
        this.direction = (typeof(mvInfo.direction) === "object") ?
            mvInfo.direction : {
                x: Math.cos(mvInfo.direction * (Math.PI / 180)),
                y: Math.sin(mvInfo.direction * (Math.PI / 180))
            };
        this.speed = {
            min: mvInfo.speed.min,
            max: mvInfo.speed.max,
            current: (mvInfo.speed.current != undefined) ?
                mvInfo.speed.current : mvInfo.speed.min,
            turning: 0.05,
            acceleration: (mvInfo.speed.acceleration != undefined) ?
                mvInfo.speed.acceleration : mvInfo.speed.max,
            decelearation: (mvInfo.speed.decelearation != undefined) ?
                mvInfo.speed.decelearation : mvInfo.speed.acceleration,
            decelerate: function() {
                if (this.current - this.decelearation < this.min) {
                    this.current = this.min;
                } else {
                    this.current -= this.decelearation;
                }
            },
            accelerate: function() { // name's gross
                if (this.current + this.acceleration > this.max) {
                    this.current = this.max;
                } else {
                    this.current += this.acceleration;
                }
            }
        };
        // direction methods 
        this.direction.magnitude = function() {
            return Math.sqrt(this.x**2 + this.y**2);
        }
        this.direction.turn = (axis, targetDirection, sign = 1, speed = this.speed.turning) => {
            sign = Math.sign(sign);
            if (sign > 0) {
                if (this.direction[axis] + speed > targetDirection) {
                    this.direction[axis] = targetDirection;
                } else {
                    this.direction[axis] += speed;
                }
            } else if (sign < 0) {
                if (this.direction[axis] - speed < targetDirection) {
                    this.direction[axis] = targetDirection;
                } else {
                    this.direction[axis] -= speed;
                }
            }
        };
        this.collisionConfig = {
            rebound: false,
            onCollision: {
                x: () => {
                    // move entity back within drawSpace
                    if (this.x < StdEntity.drawSpace.x) {
                        this.x = StdEntity.drawSpace.x; // + this.size.width;
                    } else {
                        this.x = StdEntity.drawSpace.width - this.size.width;
                    }

                    // cause entity to rebound if it is enabled
                    if (this.collisionConfig.rebound === true) {
                        this.direction.x = -this.direction.x;
                    }
                },
                y: () => {
                    // move entity back within drawSpace
                    if (this.y < StdEntity.drawSpace.y) {
                        this.y = StdEntity.drawSpace.y; // + this.size.height;
                    } else {
                        this.y = StdEntity.drawSpace.height - this.size.height;
                    }
                    
                    // cause entity to rebound if it is enabled
                    if (this.collisionConfig.rebound === true) {
                        this.direction.y = -this.direction.y;
                    }
                }
            }
        }

        // internal properties
        // todo - find better name
        this.debug = false;
        this._inputConfig = {
            up: {
                action: {
                    enabled: () => {
                        this.direction.turn('y', 1);
                        this.speed.accelerate();
                    },
                    disabled: () => {
                        this.direction.turn('y', 0, -1);
                        if (this.direction.y === 0) {
                            this._inputConfig.up.flag.keyup = false;
                        }
                    }
                },
                keybind: "KeyW",
                flag: {
                    keydown: false,
                    keyup: false
                }
            },
            down: {
                action: {
                    enabled: () => {
                        this.direction.turn('y', -1, -1);
                        this.speed.accelerate();
                    },
                    disabled: () => {
                        this.direction.turn('y', 0);
                        if (this.direction.y === 0) {
                            this._inputConfig.down.flag.keyup = false;
                        }
                    }
                },
                keybind: "KeyS",
                flag: {
                    keydown: false,
                    keyup: false
                }
            },
            left: {
                action: {
                    enabled: () => {
                        this.direction.turn('x', -1, -1);
                        this.speed.accelerate();
                    },
                    disabled: () => {
                        this.direction.turn('x', 0);
                        if (this.direction.x === 0) {
                            this._inputConfig.left.flag.keyup = false;
                        }
                    }
                },
                keybind: "KeyA",
                flag: {
                    keydown: false,
                    keyup: false
                }
            },
            right: {
                action: {
                    enabled: () => {
                        this.direction.turn('x', 1);
                        this.speed.accelerate();
                    },
                    disabled: () => {
                        this.direction.turn('x', 0, -1);
                        if (this.direction.x === 0) {
                            this._inputConfig.right.flag.keyup = false;
                        }
                    }
                },
                keybind: "KeyD",
                flag: {
                    keydown: false,
                    keyup: false
                }
            }
        };
        
        // extra setup
        // leaving this for the user to set up
        // this._initEventListeners();
    }
    _drawRectangle() {
        StdEntity.ctx.fillStyle = this.color;
        StdEntity.ctx.fillRect(this.x, this.y, this.size.width, this.size.height);
    }
    _drawCircle() {
        // an offset is added to make the circle draw as if it was a square
        // where it draws starting at the top right rather than the center
        let offset = this.size.width / 2;
        StdEntity.ctx.beginPath();
        
        // width is used for radius for convenience
        StdEntity.ctx.arc(this.x + offset, this.y + offset, this.size.width / 2, 0, Math.PI * 2);
        
        // draw
        StdEntity.ctx.fillStyle = this.color;
        StdEntity.ctx.fill();
    }
    _drawError() {
        // only use this method if something is wrong
        let size = 20;
        StdEntity.ctx.beginPath();
        
        // square
        StdEntity.ctx.moveTo(this.x, this.y);
        StdEntity.ctx.lineTo(this.x + size, this.y);
        StdEntity.ctx.lineTo(this.x + size, this.y + size);
        StdEntity.ctx.lineTo(this.x, this.y + size);
        StdEntity.ctx.lineTo(this.x, this.y);
        
        // cross
        StdEntity.ctx.lineTo(this.x + size, this.y + size);
        StdEntity.ctx.moveTo(this.x + size, this.y);
        StdEntity.ctx.lineTo(this.x, this.y + size);
        
        // draw
        StdEntity.ctx.strokeStyle = "rgb(255, 0, 0)";
        StdEntity.ctx.stroke();
    }
    _drawDebugArrow() {
        // lot of calculations to make everything dynamic
        let multiplier = this.size.height * 0.25;
        let cenX = this.x + (this.size.width / 2);
        let cenY = this.y + (this.size.height / 2);
        let newX = (this.direction.x / this.direction.magnitude()) * this.speed.current;
        let newY = (this.direction.y / this.direction.magnitude()) * this.speed.current;
        StdEntity.ctx.beginPath();
        StdEntity.ctx.strokeStyle = "rgb(255, 255, 255)";
        
        // arrow shaft
        StdEntity.ctx.moveTo(cenX, cenY);
        StdEntity.ctx.lineTo(
            cenX + (newX * multiplier),
            cenY - (newY * multiplier)
        );
        StdEntity.ctx.stroke();
        
        // arrow head
        // todo - finish
        // StdEntity.ctx.beginPath();
        // StdEntity.ctx.fillStyle = "rgb(255, 255, 0)";
        // StdEntity.ctx.moveTo(
        //     cenX + (newX * multiplier),
        //     cenY - (newY * multiplier),
        // );
        // StdEntity.ctx.lineTo(
            
        // );
        StdEntity.ctx.stroke();
    }
    draw() {
        // todo - allow custom draw functions to be loaded
        switch (this.shape) {
            case "rectangle":
            this._drawRectangle();
            break;
        case "circle":
            this._drawCircle();
            break;
        default:
            this._drawError();
            console.log(`ERROR: ${this.shape} does not have a corresponding draw method`);
            break;
        }
        
        // debugging
        if (this.debug === true) {
            this._drawDebugArrow();
        }
    }
    _move() {
        // normalize vector by dividing component by magnitude
        // todo - prevent snapping when going opposite direction
        if (this.direction.x === 0 && this.direction.y === 0) {
            return undefined;
        } else {
            this.x += (this.direction.x / this.direction.magnitude()) * this.speed.current;
            this.y -= (this.direction.y / this.direction.magnitude()) * this.speed.current;
        }
    }
    _collisionDetection() {
        // todo - work on collision for other objects
        if (this.x < StdEntity.drawSpace.x || this.x > StdEntity.drawSpace.width - this.size.width) {
            // run onCollision
            this.collisionConfig.onCollision.x();
        }
        if (this.y < StdEntity.drawSpace.y || this.y > StdEntity.drawSpace.height - this.size.height) {
            // run onCollision
            this.collisionConfig.onCollision.y();
        }
    }
    _inputHandler(e, eventType) {
        Object.keys(this._inputConfig).forEach(key => {
            if (this._inputConfig[key].keybind === e.code) {
                // change flag based on key state
                this._inputConfig[key].flag.keydown = (eventType === "keydown") ? true : false;
                this._inputConfig[key].flag.keyup = (eventType === "keyup") ? true : false;
            }
        });
    }
    _inputActionHandler() {
        let anyFlagsTrue = false
        // run through actions of every keybind with an enabled flag
        Object.keys(this._inputConfig).forEach(key => {
            if (this._inputConfig[key].flag.keydown === true) {
                this._inputConfig[key].action.enabled();
                anyFlagsTrue = true;
            } else if (this._inputConfig[key].flag.keyup === true) {
                this._inputConfig[key].action.disabled();
            }
        });
        if (anyFlagsTrue === false) {
            this.speed.decelerate();
        }
    }
    addKeybind(name, keybind, action) {
        this._inputConfig[name] = {
            action: action,
            keybind: keybind,
            flag: {
                keydown: false,
                keyup: false
            }
        }
    }
    initEventListeners() {
        window.addEventListener("keydown", (e) => {this._inputHandler(e, "keydown")});
        window.addEventListener("keyup", (e) => {this._inputHandler(e, "keyup")});
    }
    tp(x, y) {
        this.x = x;
        this.y = y;
    }
    update() {
        // this.draw();
        this._move();
        this._collisionDetection();
        this._inputActionHandler();
    }
    static resizeDrawSpace(x, y, width, height, margin = 0) {
        this.drawSpace.x = x + margin;
        this.drawSpace.y = y + margin;
        this.drawSpace.width = width - margin;
        this.drawSpace.height = height - margin;
    }
}