import { Expression } from "./Expression";
import { Statement, StatementVisitor } from "./Statement";

export class BlockStatement extends Statement {
    readonly statements:Statement[];

    constructor(statements:Statement[]) {
        super();
        this.statements = statements;
    }

    accept(v: StatementVisitor) {
        return v.visitForBlockStatement(this);
    }
    
}