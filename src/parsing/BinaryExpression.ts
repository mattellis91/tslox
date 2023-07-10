import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class BinaryExpression extends Expression {
    readonly left: Expression;
    readonly operator: Token;
    readonly right: Expression;

    constructor(left:Expression, operator:Token, right:Expression) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    toString(): string {
        return `Binary Expression: ${this.left} ${this.operator} ${this.right}`;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForBinaryExpression(this);
    }
}