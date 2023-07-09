import { Token } from "../lexing/Token";
import { Expression, Visitor } from "./Expression";

export class UnaryExpression extends Expression {
    readonly operator: Token;
    readonly right: Expression;

    constructor(operator: Token, right: Expression) {
        super();
        this.operator = operator;
        this.right = right;
    }

    toString(): string {
        return `Unary Expression: ${this.operator} ${this.right}`;
    }
    
    accept(v: Visitor) {
        return v.visitForUnaryExpression(this);
    }
}