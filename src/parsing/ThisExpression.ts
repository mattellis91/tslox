import { Token } from "../lexing/Token";
import { Expression, ExpressionVisitor } from "./Expression";

export class ThisExpression extends Expression {
    readonly keyword: Token;

    constructor(keyword: Token) {
        super();
        this.keyword = keyword;
    }

    toString(): string {
        return `This Expression: ${this.keyword}`;
    }

    accept(v: ExpressionVisitor) {
        return v.visitForThisExpression(this);
    }
    
}