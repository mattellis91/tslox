import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class VariableExpression extends Expression {
    readonly name: Token;

    constructor(name:Token) {
        super();
        this.name = name;
    }

    toString(): string {
        return `Variable Expression: ${this.name.lexeme}`;
    }
    
    accept(v: ExpressionVisitor) {
        return v.visitForVariableExpression(this);
    }
}