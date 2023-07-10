import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

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
    
    accept(v: ExpressionVisitor) {
        return v.visitForUnaryExpression(this);
    }
}