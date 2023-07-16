import { Token } from "../lexing/Token";
import { RuntimeError } from "./RuntimeError";

export class Environment {
    private values:Record<string, any> = {};

    define(name:string, value:any) {
        this.values[name] = value;
    }

    get(name:Token) : any {
        if(this.values[name.lexeme] !== undefined) {
            return this.values[name.lexeme];
        }

        throw new RuntimeError(name, "Undefined variable ' " + name.lexeme + "'.");
    }

    assign(name:Token, value:any) : any {
        if(this.values[name.lexeme] !== undefined) {
            this.values[name.lexeme] = value;
            return;
        }

        throw new RuntimeError(name, "Undefined variable ' " + name.lexeme + "'.")
    }
}