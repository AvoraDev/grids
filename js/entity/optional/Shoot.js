import { NPC } from "../NPC.js";
import { StdEntity } from "../StdEntity.js";

/**
 * Add shooting capabilities to a StdEntity object 
 * @param {StdEntity} entity
 * @param {string} keybind='Space'
 * @returns {void}
 */
export function addShooting(entity, bulletColor, keybind = 'Space') {
    entity._shooting = {
        bullets: [],
        start: undefined,
        cooldown: 100 // ms
    };

    entity.AddKeybind('shoot', keybind, () => {
        let currentTime = new Date();
        if (entity._shooting.start === undefined) {
            entity._shooting.start = new Date();
            entity._shooting.start.setTime(1); // big number
        }
        let extension = 20;
    
        if (currentTime.getTime() - entity._shooting.start.getTime() > entity._shooting.cooldown) {
            entity._shooting.bullets.push(new NPC(
                entity.x + (entity.direction.x * extension),
                entity.y - (entity.direction.y * extension),
                entity.mass * 0.75,
                {
                    color: bulletColor,
                    shape: "triangle",
                    width: entity.width * 0.75
                },
                {
                    direction: {
                        x: entity.direction.x,
                        y: entity.direction.y
                    },
                    speed: {
                        min: entity.speed.max * 1.25,
                        max: entity.speed.max * 1.25
                    }
                }
            ))
            entity._shooting.bullets[entity._shooting.bullets.length - 1].collisionRebound = true;
            entity._shooting.start = new Date();
        }
    });
}