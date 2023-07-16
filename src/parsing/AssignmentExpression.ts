import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class AssignmentExpression extends Expression {
    
    name:Token;
    value:Expression;

    constructor(name:Token, value:Expression) {
        super();
        this.name = name;
        this.value = value;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForAssignmentExpression(this)
    }

    toString(): string {
        return `Assignment Expression: ${this.name} ${this.value.toString()}`;
    }
}