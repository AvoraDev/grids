import { StdEntity } from "./StdEntity.js";

export class NPC extends StdEntity {
    constructor(x, y, mass, appearance, movementInfo) {
        super(x, y, mass, appearance, movementInfo);
    }
    _update() {
        this._move();
        // if (this.invincibility === true) {
        //     let time = new Date();
        //     if (time.getMilliseconds() - this.collisionConfig.iFrameStart.getMilliseconds() > this.collisionConfig.iFrameDur) {
        //         this.invincibility = false;
        //         this._collisionDetection();
        //     }
        // } else {
            this._collisionDetection();
        // }
        this._drawSpaceCollisionDetection();
        // this is the only difference so i'm not sure if it should have it's own file
        // this._inputActionHandler();
    }
}