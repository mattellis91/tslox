import { Expression } from "./Expression";
import { Statement, StatementVisitor } from "./Statement";

export class PrintStatement extends Statement {
    readonly expression:Expression;
    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    accept(v: StatementVisitor) {
        return v.visitForPrintStatement(this);
    }
}