import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class SetExpression extends Expression {
    readonly object: Expression;
    readonly name: Token;
    readonly value: Expression;

    constructor(object: Expression, name: Token, value: Expression) {
        super();
        this.object = object;
        this.name = name;
        this.value = value;
    }

    toString(): string {
        return `Set Expression: ${this.object} ${this.name} ${this.value}`; 
    }

    accept(v: ExpressionVisitor) {
        return v.visitForSetExpression(this);
    }
}