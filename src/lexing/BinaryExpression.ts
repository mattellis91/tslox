import { Token } from "../Token";
import { Expression, Visitor } from "./Expression";

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

    accept(v: Visitor) {
        return v.visitForBinaryExpression(this);
    }
}