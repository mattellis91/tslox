import { FunctionStatement } from "../parsing/FunctionStatement";
import { Statement } from "../parsing/Statement";
import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { LoxInstance } from "./LoxInstance";
import { Return } from "./Return";

export class LoxFunction implements Callable {
    readonly declaration: FunctionStatement;
    readonly closure: Environment;
    readonly isInitializer: boolean

    constructor(declaration: FunctionStatement, closure: Environment, isInitializer:boolean) {
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }

    call(interpreter: any, args: any[]) {
        const environment = new Environment(this.closure);
        for(let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue: unknown) {
            
            if(this.isInitializer) {
                return this.closure.getAt(0, "this");
            }

            if(returnValue instanceof Return) {
                return (returnValue as Return).value;
            }

            return returnValue;
        }

        if(this.isInitializer) {
            return this.closure.getAt(0, "this");
        }

        return null;
    }

    arity(): number {
        return this.declaration.params.length;
    }

    bind(instance: LoxInstance) {
        const environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment, this.isInitializer);
    }
}