import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class SuperExpression extends Expression {

    readonly keyword:Token;
    readonly method:Token;

    constructor(keyword:Token, method:Token) {
        super();
        this.keyword = keyword;
        this.method = method;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForSuperExpression(this)
    }

    toString(): string {
        return "Super Expression  " + this.keyword + this.method;
    }
}