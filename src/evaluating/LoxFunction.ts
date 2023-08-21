import { FunctionStatement } from "../parsing/FunctionStatement";
import { Statement } from "../parsing/Statement";
import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { Return } from "./Return";

export class LoxFunction implements Callable {
    readonly declaration: FunctionStatement;
    constructor(declaration: FunctionStatement) {
        this.declaration = declaration;
    }

    call(interpreter: any, args: any[]) {
        const environment = new Environment(interpreter.globals);
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
}