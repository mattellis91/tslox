import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class CallExpression extends Expression {
    readonly callee: Expression;
    readonly paren: Token;
    readonly args: Expression[];

    constructor(callee: Expression, paren: Token, args: Expression[]) {
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    toString(): string {
        return `Call Expression: ${this.callee} ${this.paren} ${this.args}`;
    }
    
    accept(v: ExpressionVisitor) {
        return v.visitForCallExpression(this);
    }
}