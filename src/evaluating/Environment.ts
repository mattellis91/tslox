import { Token } from "../lexing/Token";
import { RuntimeError } from "./RuntimeError";

export class Environment {
    private values:Record<string, any> = {};
    readonly enclosing: Environment | null;

    constructor(enclosing:Environment | null = null) {
        this.enclosing = enclosing;
    }

    define(name:string, value:any) {
        this.values[name] = value;
    }

    get(name:Token) : any {
        if(this.values[name.lexeme] !== undefined) {
            return this.values[name.lexeme];
        }

        if(this.enclosing !== null) {
            return this.enclosing.get(name);
        }

        throw new RuntimeError(name, "Undefined variable ' " + name.lexeme + "'.");
    }

    assign(name:Token, value:any) : any {
        if(this.values[name.lexeme] !== undefined) {
            this.values[name.lexeme] = value;
            return;
        }

        if(this.enclosing !== null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(name, "Undefined variable ' " + name.lexeme + "'.")
    }
}