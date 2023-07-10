import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class GroupingExpression extends Expression {
    readonly expression: Expression;

    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    toString(): string {
        return `Grouping Expression: ${this.expression}`;
    }
    accept(v: ExpressionVisitor) {
        return v.visitForGroupingExpression(this);
    }
}