import { Token } from "../lexing/Token";
import { Expression, Visitor } from "./Expression";

export class LiteralExpression extends Expression {
    readonly value: any;

    constructor(value:any) {
        super();
        this.value = value;
    }

    toString(): string {
        return `Literal Expression: ${this.value}`;
    }
    
    accept(v: Visitor) {
        return v.visitForLiteralExpression(this);
    }
}