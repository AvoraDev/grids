import { StdEntity } from "./StdEntity.js";

export class NPC extends StdEntity {
    constructor(x, y, mass, appearance, movementInfo) {
        super(x, y, mass, appearance, movementInfo);
    }
    _update() {
        // this is the only real difference so i'm not sure if it should have it's own file
        // this.draw();
        this._move();
        if (this.collisionConfig.invincible === false) {this._collisionDetection();}
        // this._inputActionHandler();
    }
}