import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { LoxFunction } from "./LoxFunction";
import { LoxInstance } from "./LoxInstance";

export class LoxClass implements Callable{
    readonly name: string;
    readonly methods: Map<string, LoxFunction> = new Map<string, LoxFunction>();
    
    constructor(name: string, methods: Map<string, LoxFunction>) {
        this.name = name;
        this.methods = methods;
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

    findMethod(name: string) : LoxFunction | undefined {
        if(this.methods.has(name)) {
            return this.methods.get(name);
        }
        return undefined;
    }
}