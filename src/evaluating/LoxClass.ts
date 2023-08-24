import { Callable } from "./Callable";
import { LoxInstance } from "./LoxInstance";

export class LoxClass implements Callable{
    readonly name: string;
    
    constructor(name: string) {
        this.name = name;
    }

    call(interpreter: any, args: any[]): any {
        const instance = new LoxInstance(this);
        return instance;
    }

    arity(): number {
        return 0;
    }

    toString() {
        return this.name;
    }
}