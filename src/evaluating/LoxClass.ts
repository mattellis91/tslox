import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { LoxFunction } from "./LoxFunction";
import { LoxInstance } from "./LoxInstance";

export class LoxClass implements Callable{
    readonly name: string;
    readonly methods: Map<string, LoxFunction> = new Map<string, LoxFunction>();
    readonly superclass: LoxClass | null = null;
    
    constructor(name: string, superclass: LoxClass | null, methods: Map<string, LoxFunction>) {
        this.name = name;
        this.methods = methods;
        this.superclass = superclass;
    }

    call(interpreter: any, args: any[]): any {
        const instance = new LoxInstance(this);

        const initializer = this.findMethod("init");
        if(initializer !== undefined) {
            initializer.bind(instance).call(interpreter, args);
        }

        return instance;
    }

    arity(): number {
        const initializer = this.findMethod("init");
        if(initializer !== undefined) {
            return initializer.arity();
        }
        return 0;
    }

    toString() {
        return this.name;
    }

    findMethod(name: string) : LoxFunction | undefined {
        if(this.methods.has(name)) {
            return this.methods.get(name);
        }

        if(this.superclass !== null) {
            return this.superclass.findMethod(name);
        } 

        return undefined;
    }
}