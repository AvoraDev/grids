export class StdEntity {
    // canvas context
    static drawSpace = {x: 0, y: 0, width: 0, height: 0};
    static ctx = {};

    // all entities
    static entities = [];
    static depths = {};

    // calculation vars
    static collisionSubsteps = 5;

    /**
     * Create an instance of StdEntity.
     * 
     * appereance properties:
     * - shape ('rectangle', 'triangle', 'circle')
     * - color
     * - width (use for diameter if using 'circle' shape)
     * - height (defaults to width)
     * - zDepth
     * 
     * mvInfo properties:
     * - direction (A number value in degrees can be given to find each component automatically)
     *     - x
     *     - y
     * - speed
     *     - min
     *     - max
     *     - current (default is min)
     *     - acceleration (default is max)
     *     - deceleration (default is acceleration)
     * @param {number} x
     * @param {number} y
     * @param {object} appearance
     * @param {object} mvInfo
     * @returns {onject}
     */
	constructor(x, y, mass, appearance, mvInfo) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.color = appearance.color;
        this._width = appearance.width;
        this._halfWidth = this._width / 2;
        this._height = (appearance.height === undefined) ?
            appearance.width :
            appearance.height;
        this._halfHeight = this._height / 2;
        this.shape = (appearance.shape === undefined) ?
            'rectangle' :
            appearance.shape;
        this.zDepth = (appearance.zDepth === undefined) ?
            0 :
            appearance.zDepth;
        this.direction = (typeof(mvInfo.direction) === 'object') ?
            mvInfo.direction :
            {
                x: Math.cos(mvInfo.direction * (Math.PI / 180)),
                y: Math.sin(mvInfo.direction * (Math.PI / 180))
            };
        this.speed = {
            min: mvInfo.speed.min,
            max: mvInfo.speed.max,
            current: (mvInfo.speed.current === undefined) ?
                mvInfo.speed.min :
                mvInfo.speed.current,
            turning: 0.05,
            acceleration: (mvInfo.speed.acceleration === undefined) ?
                mvInfo.speed.max :
                mvInfo.speed.acceleration,
            decelearation: (mvInfo.speed.decelearation === undefined) ?
                mvInfo.speed.acceleration * 0.25:
                mvInfo.speed.decelearation
        };
        this.debug = false;
        this.collisionConfig = {
            invincible: false,
            iFrameStart: undefined,
            iFrameDur: 1000 / 8, // in ms
            rebound: false
        }
        this._inputConfig = {
            up: {
                action: () => {this._defaultMovement('y', 1, ['left', 'right'])},
                keybind: 'KeyW',
                flag: false
            },
            down: {
                action: () => {this._defaultMovement('y', -1, ['left', 'right']);},
                keybind: 'KeyS',
                flag: false
            },
            left: {
                action: () => {this._defaultMovement('x', -1, ['up', 'down'])},
                keybind: 'KeyA',
                flag: false
            },
            right: {
                action: () => {this._defaultMovement('x', 1, ['up', 'down']);},
                keybind: 'KeyD',
                flag: false
            }
        };

        // add to class's arrs
        StdEntity.entities.push(this);
        this.id = StdEntity.entities.length - 1;

        // zDepth pain
        let dId = (this.zDepth < 0) ?
            `n${this.zDepth}` :
            `p${this.zDepth}`;

        if (typeof(StdEntity.depths[dId]) === 'undefined') {
            StdEntity.depths[dId] = [];
        }
        StdEntity.depths[dId].push(this.id);
    }
    _accelerate() {
        if (this.speed.current + this.speed.acceleration > this.speed.max) {
            this.speed.current = this.speed.max;
        } else {
            this.speed.current += this.speed.acceleration;
        }
    }
    _decelerate() {
        if (this.speed.current - this.speed.decelearation < this.speed.min) {
            this.speed.current = this.speed.min;
        } else {
            this.speed.current -= this.speed.decelearation;
        }
    }
    /**
     * tURN
     * @param {any} axis - 'x', 'y'
     * @param {any} targetDirection - 1, 0, -1
     * @returns {void}
     */
    _turn = (axis, targetDirection, speedMultiplier = 1) => {
        let sign = Math.sign(this.direction[axis]);
        if (targetDirection > 0 || (targetDirection === 0 && sign < 0)) { // +
            if (this.direction[axis] + this.speed.turning * speedMultiplier > targetDirection) {
                this.direction[axis] = targetDirection;
            } else {
                this.direction[axis] += this.speed.turning * speedMultiplier;
            }
        } else if (targetDirection < 0 || (targetDirection === 0 && sign > 0)) { // -
            if (this.direction[axis] - this.speed.turning * speedMultiplier < targetDirection) {
                this.direction[axis] = targetDirection;
            } else {
                this.direction[axis] -= this.speed.turning * speedMultiplier;
            }
        }
    };
    _defaultMovement = (axis, targetDirection, sideFlags, spinBuffer = 0.25) => {
        // turns
        if (targetDirection > 0) { // + 
            if (this.direction[axis] < 0 - spinBuffer) {
                this._turn(axis, targetDirection, 4);
            } else {
                this._turn(axis, targetDirection);
            }
        } else { // -
            if (this.direction[axis] > 0 + spinBuffer) {
                this._turn(axis, targetDirection, 4);
            } else {
                this._turn(axis, targetDirection);
            }
        }
        
        // opposite axis realignment (?)
        if (this._inputConfig[sideFlags[0]].flag === false && this._inputConfig[sideFlags[1]].flag === false) {
            this._turn((axis === 'x') ? 'y' : 'x', 0);
        }

        // start shmoovin' (this should be further worked on)
        this._accelerate();
    };
    /**
     * Rotate a point around the origin (0, 0) using radians.
     * @param {number} x
     * @param {number} y
     * @param {number} angleRad
     * @returns {number}
     */
    _rotatePoint(x, y, angleRad) {
        /* Math is weird
        x -> x'
        y -> y'

        x' = (x cos(d)) + (y sin(d))
        y' = (x sin(d)) + (-y cos(d))
        */
        let cos = Math.cos(angleRad);
        let sin = Math.sin(angleRad);
        return [
            (x * cos) + (y * sin),
            (x * sin) + (-y * cos),
        ];
    }
    _drawRectangle() {
        StdEntity.ctx.fillStyle = this.color;
        StdEntity.ctx.fillRect(
            this.x - this._halfWidth,
            this.y - this._halfHeight,
            this.width,
            this.height
        );
    }
    _drawCircle() {
        StdEntity.ctx.beginPath();
        
        // width is used for radius arbitrarilly (spelling?)
        StdEntity.ctx.arc(this.x, this.y, this._halfWidth, 0, Math.PI * 2);
        
        // draw
        StdEntity.ctx.fillStyle = this.color;
        StdEntity.ctx.fill();
    }
    _drawTriangle() {
        // triangle points
        let angle = -Math.atan2(this.direction.y, this.direction.x);
        const p = [ // height being divided is the offset
            this._rotatePoint(this._halfHeight, 0, angle),
            this._rotatePoint(-this._halfHeight, this._halfWidth, angle),
            this._rotatePoint(-this._halfHeight, -this._halfWidth, angle)
        ];

        // draw points
        StdEntity.ctx.beginPath();
        StdEntity.ctx.moveTo(p[0][0] + this.x, p[0][1] + this.y);
        StdEntity.ctx.lineTo(p[1][0] + this.x, p[1][1] + this.y);
        StdEntity.ctx.lineTo(p[2][0] + this.x, p[2][1] + this.y);
        StdEntity.ctx.closePath();

        // draw
        StdEntity.ctx.fillStyle = this.color; // this.color;
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
        StdEntity.ctx.strokeStyle = 'rgb(255, 0, 0)';
        StdEntity.ctx.stroke();
    }
    _drawDebugArrow() {
        // lot of calculations to make everything dynamic
        let extension = this.height * 0.25;
        let newX = (this.direction.x / this.dirMagnitude) * this.speed.current;
        let newY = (this.direction.y / this.dirMagnitude) * this.speed.current;
        StdEntity.ctx.beginPath();
        
        // arrow shaft
        StdEntity.ctx.moveTo(this.x, this.y);
        StdEntity.ctx.lineTo(
            this.x + (newX * extension),
            this.y - (newY * extension)
        );
        StdEntity.ctx.strokeStyle = 'rgb(255, 255, 255)';
        StdEntity.ctx.stroke();
        
        // arrow tip (taken from this._drawArrow())
        let angle = -Math.atan2(this.direction.y, this.direction.x);
        const p = [ // height being divided is the offset
            this._rotatePoint(this.height / 4, 0, angle),
            this._rotatePoint(-this.height / 4, this.width / 4, angle),
            this._rotatePoint(-this.height / 4, -(this.width / 4), angle)
        ];
        StdEntity.ctx.beginPath();
        StdEntity.ctx.moveTo(p[0][0] + (this.x + (newX * extension)), p[0][1] + (this.y - (newY * extension)));
        StdEntity.ctx.lineTo(p[1][0] + (this.x + (newX * extension)), p[1][1] + (this.y - (newY * extension)));
        StdEntity.ctx.lineTo(p[2][0] + (this.x + (newX * extension)), p[2][1] + (this.y - (newY * extension)));
        StdEntity.ctx.closePath();
        StdEntity.ctx.fillStyle = 'rgb(255, 255, 255)';
        StdEntity.ctx.fill();
    }
    _drawHitBox() {
        let points = this.collisionPoints;
        StdEntity.ctx.moveTo(points[0].x, points[0].y);
        StdEntity.ctx.lineTo(points[1].x, points[1].y);
        StdEntity.ctx.lineTo(points[3].x, points[3].y);
        StdEntity.ctx.lineTo(points[2].x, points[2].y);
        StdEntity.ctx.closePath();

        StdEntity.ctx.strokeStyle = 'rgb(255, 255, 255)';
        StdEntity.ctx.stroke();
    }
    _move() {
        // normalize vector by dividing component by magnitude
        if (this.direction.x === 0 && this.direction.y === 0) {
            return;
        } else {
            this.x += (this.direction.x / this.dirMagnitude) * this.speed.current;
            this.y -= (this.direction.y / this.dirMagnitude) * this.speed.current;
        }
    }
    _resolveCollision(entityId) {
        // todo - look into implementing mass and velocity transfer
        // distances
        let disX = StdEntity.entities[entityId].x - this.x;
        let disY = StdEntity.entities[entityId].y - this.y;

        // angle from current entity to collided entity
        let angle = Math.atan2(disY, disX) * (180 / Math.PI);
        angle = (angle < 0) ? 360 + angle : angle;

        // overlap between entities
        let overlapX = (StdEntity.entities[entityId]._halfWidth + this._halfWidth) - Math.abs(disX);
        let overlapY = (StdEntity.entities[entityId]._halfHeight + this._halfHeight) - Math.abs(disY);

        // resolve overlap
        /* Shift Direction Truth Table (Q - quadrant)
        Note: angle is using conventional x and y axis while canvas inverts y
        0 < a < 90      Q1  x-  y+
        90 < a < 180    Q2  x+  y+
        180 < a < 270   Q3  x+  y-
        270 < a < 360   Q4  x-  y-
        */
        if (overlapX < (StdEntity.entities[entityId]._halfWidth + this._halfWidth) * 0.3) {
            // get halves and substeps
            overlapX /= 2 + StdEntity.collisionSubsteps;

            // add margin and shift direction
            let finalX = (overlapX + 1) * Math.sign(disX);

            // shift entities
            this.x -= finalX;
            StdEntity.entities[entityId].x += finalX;
        }
        if (overlapY < (StdEntity.entities[entityId]._halfHeight + this._halfHeight) * 0.3) {
            // get halves and substeps
            overlapY /= 2 + StdEntity.collisionSubsteps;
            
            // add margin and shift direction
            let finalY = (overlapY + 1) * Math.sign(disY);

            this.y -= finalY;
            StdEntity.entities[entityId].y += finalY;
        }

        // invert direction
        // todo - its a bit janky, consider bouncing off like in _drawSpaceCollision()
        if (this.collisionConfig.rebound === true) {
            let disT = Math.sqrt(disX**2 + disY**2);
            this.direction.x = -(disX / disT); // cosine
            this.direction.y = -(disY / disT); // sin
        }
    }
    _drawSpaceCollisionDetection() {
        // outer bounds collision
        // todo - see if it should only check when it's near the edge
        if (
            this.x - this._halfWidth < StdEntity.drawSpace.x ||
            this.x + this._halfWidth > StdEntity.drawSpace.width
        ) {
            // move entity back within drawSpace
            if (this.x - this._halfWidth < StdEntity.drawSpace.x) {
                this.x = StdEntity.drawSpace.x + this._halfWidth;
            } else {
                this.x = StdEntity.drawSpace.width - this._halfWidth;
            }
            
            if (this.collisionConfig.rebound === true) {
                this.direction.x = -this.direction.x;
            }
        }
        if (
            this.y - this._halfHeight < StdEntity.drawSpace.y ||
            this.y + this._halfHeight > StdEntity.drawSpace.height
        ) {
            // move entity back within drawSpace
            if (this.y - this._halfHeight < StdEntity.drawSpace.y) {
                this.y = StdEntity.drawSpace.y + this._halfHeight;
            } else {
                this.y = StdEntity.drawSpace.height - this._halfHeight;
            }

            if (this.collisionConfig.rebound === true) {
                this.direction.y = -this.direction.y;
            }
        }
    }
    _collisionDetection() {
        // 'sweep and prune' algorithm - broad phase
        let possibleCollisions = [];
        for (let i = 0; i < StdEntity.entities.length; i++) {
            // skip itself
            if (i === this.id) {
                continue;
            }

            // check if any item's min x value is equal or less than the current items max x value
            // invert min and max to prune further
            if (
                (StdEntity.entities[i].x - StdEntity.entities[i]._halfWidth) <= (this.x + StdEntity.entities[i]._halfWidth) &&
                (StdEntity.entities[i].x + StdEntity.entities[i]._halfWidth) >= (this.x - StdEntity.entities[i]._halfWidth)
            ) {
                possibleCollisions.push(i);
            }
        }

        // ?? - narrow phase
        let mainPoints = this.collisionPoints;
        mainPoints.forEach(point => {
            possibleCollisions.forEach(entityId => {
                if (
                    (
                        (point.x > StdEntity.entities[entityId].x - StdEntity.entities[entityId]._halfWidth) &&
                        (point.x < StdEntity.entities[entityId].x + StdEntity.entities[entityId]._halfWidth)
                    ) &&
                    (
                        (point.y > StdEntity.entities[entityId].y - StdEntity.entities[entityId]._halfHeight) &&
                        (point.y < StdEntity.entities[entityId].y + StdEntity.entities[entityId]._halfHeight)
                    )
                ) {
                    this._resolveCollision(entityId);
                }
            });
        });
    }
    _inputHandler(e, eventType) {
        Object.keys(this._inputConfig).forEach(key => {
            if (this._inputConfig[key].keybind === e.code) {
                this._inputConfig[key].flag = (eventType === 'keydown') ? true : false;

                // DEPRICATED
                // this._inputConfig[key].flag.keydown = (eventType === 'keydown') ? true : false; (old ver)
                // this._inputConfig[key].flag.keyup = (eventType === 'keyup') ? true : false;
            }
        });
    }
    _inputActionHandler() {
        // only decelerate when no flags have been raised
        let anyFlagsTrue = false

        // run through actions of every keybind with a flag raised
        Object.keys(this._inputConfig).forEach(key => {
            if (this._inputConfig[key].flag === true) {
                this._inputConfig[key].action();
                
                if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
                    anyFlagsTrue = true;
                }
            }
            
            // DEPRICATED
            // else if (this._inputConfig[key].flag.keyup === true) {
            //     this._inputConfig[key].action.disabled();
            // }
        });
        if (anyFlagsTrue === false) {
            this._decelerate();
        }
    }
    _draw() {
        // todo - allow custom draw functions to be loaded
        switch (this.shape) {
            case 'rectangle':
            this._drawRectangle();
            break;
        case 'circle':
            this._drawCircle();
            break;
        case 'triangle':
            this._drawTriangle();
            break;
        default:
            this._drawError();
            console.log(`ERROR: ${this.shape} does not have a corresponding draw method`);
            break;
        }
        
        // debugging
        if (this.debug === true) {
            this._drawDebugArrow();
            this._drawHitBox();
        }
    }
    _update() {
        this._move();
        if (this.invincibility === true) {
            let currentTime = new Date();
            let dur = currentTime.getTime() - this.collisionConfig.iFrameStart.getTime();
            // console.log(this.id + ' | ' + temp + 'ms')

            if (dur >= this.collisionConfig.iFrameDur) {
                this.invincibility = false;
                this._collisionDetection();
            }
        } else {
            this._collisionDetection();
        }
        this._drawSpaceCollisionDetection();
        this._inputActionHandler();
    }
    /**
     * Add a keybind to an instance of StdEntity.
     * @param {string} name
     * @param {string} keybind - using Event.code
     * @param {function} action
     * @returns {void}
     */
    addKeybind(name, keybind, action) {
        this._inputConfig[name] = {
            action: action,
            keybind: keybind,
            flag: false
        }
    }
    /**
     * Add event listeners to handle key inputs.
     * @returns {void}
     */
    initEventListeners() {
        window.addEventListener('keydown', (e) => {this._inputHandler(e, 'keydown')});
        window.addEventListener('keyup', (e) => {this._inputHandler(e, 'keyup')});
    }
    /**
     * 'Teleport' entity to specified coordinates.
     * @param {number} x
     * @param {number} y
     * @returns {void}
     */
    tp(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Resize the space where an entity is allowed to be. Affects all instances.
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} margin=0
     * @returns {void}
     */
    static resizeDrawSpace(x, y, width, height, margin = 0) {
        this.drawSpace.x = x + margin;
        this.drawSpace.y = y + margin;
        this.drawSpace.width = width - margin;
        this.drawSpace.height = height - margin;
    }
    static drawAll() {
        // note: the sort function could be a preformance issue
        Object.keys(this.depths).sort().forEach(level => {
            this.depths[level].forEach(i => {
                this.entities[i]._draw();
            });
        });
    }
    static updateAll() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]._update();
        }
    }
    // complicated
    /**
     * Get collision points in a 2D object array
     * Order: [top left, top right, bottom left, bottom right]
     * @returns {Array}
     */
    get collisionPoints() {
        // todo - add support for hitboxes other than rectangles
        return [
            {x: this.x - this._halfWidth, y: this.y + this._halfHeight},  // top left
            {x: this.x + this._halfWidth, y: this.y + this._halfHeight},  // top right
            {x: this.x - this._halfWidth, y: this.y - this._halfHeight},  // bottom left
            {x: this.x + this._halfWidth, y: this.y - this._halfHeight},  // bottom right
            {x: this.x, y: this.y - this._halfHeight},                   // top mid
            {x: this.x, y: this.y + this._halfHeight},                   // bottom mid
            {x: this.x - this._halfWidth, y: this.y},                    // left mid
            {x: this.x + this._halfWidth, y: this.y},                    // right mid
        ];
    }
    get dirMagnitude() {return Math.sqrt(this.direction.x**2 + this.direction.y**2);}
    
    get width() {return this._width;}
    set width(w) {
        this._width = w;
        this._halfWidth = w / 2;
    }

    get height() {return this._height;}
    set height(h) {
        this._height = h;
        this._halfHeight = h / 2;
    }
    
    get invincibility() {return this.collisionConfig.invincible;}
    set invincibility(bool) {
        if (bool === true) {
            this.collisionConfig.invincible = true;
            this.collisionConfig.iFrameStart = new Date();
        } else {
            this.collisionConfig.invincible = false;
        }
    }
}