import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class LiteralExpression extends Expression {
    readonly value: any;

    constructor(value:any) {
        super();
        this.value = value;
    }

    toString(): string {
        return `Literal Expression: ${this.value}`;
    }
    
    accept(v: ExpressionVisitor) {
        return v.visitForLiteralExpression(this);
    }
}