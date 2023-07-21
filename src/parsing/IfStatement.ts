import { Expression } from "./Expression";
import { Statement, StatementVisitor } from "./Statement";

export class IfStatement extends Statement {
    readonly condition:Expression;
    readonly thenBranch:Statement;
    readonly elseBranch:Statement | null;
    constructor(condition:Expression, thenBranch:Statement, elseBranch:Statement | null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept(v: StatementVisitor) {
        return v.visitForIfStatement(this);
    }
}