import { Token } from "../lexing/Token";
import { Expression, Visitor } from "./Expression";

export class GroupingExpression extends Expression {
    readonly expression: Expression;

    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    toString(): string {
        return `Grouping Expression: ${this.expression}`;
    }
    accept(v: Visitor) {
        return v.visitForGroupingExpression(this);
    }
}