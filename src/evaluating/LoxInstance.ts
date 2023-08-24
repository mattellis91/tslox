import { Token } from "../lexing/Token";
import { LoxClass } from "./LoxClass";

export class LoxInstance {
    private lClass: LoxClass;
    private readonly fields: Map<string, any> = new Map<string, any>();

    constructor(lClass: LoxClass) {
        this.lClass = lClass;
    }

    toString() {
        return `${this.lClass.name} instance`;
    }

    get(name: Token) : any {
        if(this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme);
        }

        throw new Error(`Undefined property '${name.lexeme}'.`);
    }

    set(name: Token, value: any) {
        this.fields.set(name.lexeme, value);
    }
}