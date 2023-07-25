import { Token } from "../lexing/Token";
import { Expression } from "./Expression";
import { Statement, StatementVisitor } from "./Statement";

export class WhileStatement extends Statement {
    readonly condition:Expression;
    readonly body:Statement;

    constructor(condition:Expression, body:Statement) {
        super();
        this.condition = condition;
        this.body = body;
    }

    accept(v: StatementVisitor) {
        return v.visitForWhileStatement(this);
    }
}