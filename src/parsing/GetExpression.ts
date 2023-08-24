import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class GetExpression extends Expression {
    readonly object: Expression;
    readonly name: Token;

    constructor(object: Expression, name: Token) {
        super();
        this.object = object;
        this.name = name;
    }

    toString(): string {
        return `Get Expression: ${this.object} ${this.name}`;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForGetExpression(this);
    }
}