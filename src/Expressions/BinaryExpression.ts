import { Token } from "../Token";
import { Expression } from "./Expression";

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
}