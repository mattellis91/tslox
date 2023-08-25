import { FunctionStatement } from "../parsing/FunctionStatement";
import { Statement } from "../parsing/Statement";
import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { LoxInstance } from "./LoxInstance";
import { Return } from "./Return";

export class LoxFunction implements Callable {
    readonly declaration: FunctionStatement;
    readonly closure: Environment;
    constructor(declaration: FunctionStatement, closure: Environment) {
        this.declaration = declaration;
        this.closure = closure;
    }

    call(interpreter: any, args: any[]) {
        const environment = new Environment(this.closure);
        for(let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue: unknown) {
            if(returnValue instanceof Return) {
                return (returnValue as Return).value;
            }
            return returnValue;
        }

        return null;
    }

    arity(): number {
        return this.declaration.params.length;
    }

    bind(instance: LoxInstance) {
        const environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment);
    }
}