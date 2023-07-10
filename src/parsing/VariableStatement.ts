import { Token } from "../lexing/Token";
import { Expression } from "./Expression";
import { Statement, StatementVisitor } from "./Statement";

export class VariableStatement extends Statement {
    readonly name:Token;
    readonly initializer:Expression | null;

    constructor(name:Token, initializer:Expression | null) {
        super();
        this.name = name;
        this.initializer = initializer;
    }

    accept(v: StatementVisitor) {
        return v.visitForVariableStatement(this);
    }
}