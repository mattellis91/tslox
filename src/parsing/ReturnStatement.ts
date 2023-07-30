import { Statement, StatementVisitor } from "./Statement";

export class ReturnStatement extends Statement {
    readonly keyword: any;
    readonly value: any;
    constructor(keyword: any, value: any) {
        super();
        this.keyword = keyword;
        this.value = value;
    }
    toString() {
        return `Return Statement: ${this.keyword} ${this.value}`;
    }
    accept(v: StatementVisitor) {
        return v.visitForReturnStatement(this);
    }
}