import { Token } from "../lexing/Token";
import { Statement, StatementVisitor } from "./Statement";

export class FunctionStatement extends Statement {
    readonly name: Token;
    readonly params: Token[];
    readonly body: Statement[];
    constructor(name: Token, params: Token[], body: Statement[]) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }
    toString() {
        return `Function Statement: ${this.name} ${this.params} ${this.body}`;
    }
    accept(v:StatementVisitor) {
        return v.visitForFunctionStatement(this);
    }
}