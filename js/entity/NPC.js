import { StdEntity } from "./StdEntity.js";

export class NPC extends StdEntity {
    constructor(x, y, mass, appearance, movementInfo) {
        super(x, y, mass, appearance, movementInfo);
    }
    _inputActionHandler() {
        // used in _update()
        // isn't needed in a entity that won't be controlled
        return;
    }
}