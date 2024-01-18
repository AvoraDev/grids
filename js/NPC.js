import { StdEntity } from "./StdEntity.js";

export class NPC extends StdEntity {
    constructor(x, y, appearance, movementInfo) {
        super(x, y, appearance, movementInfo);
    }
    update() {
        // this is the only real difference so i'm not sure if it should have it's own file
        this._draw();
        this._move();
        // this._inputActionHandler();
    }
}