import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class SuperExpression extends Expression {

    readonly keyword:Token;

    constructor(keyword:Token) {
        super();
        this.keyword = keyword;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForSuperExpression(this)
    }

    toString(): string {
        return "Super Expression  " + this.keyword;
    }
}