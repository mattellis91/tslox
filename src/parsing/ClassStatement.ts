import { Token } from "../lexing/Token";
import { FunctionStatement } from "./FunctionStatement";
import { Statement, StatementVisitor } from "./Statement";
import { VariableExpression } from "./VariableExpression";

export class ClassStatement extends Statement {

    readonly name: Token;
    readonly superclass: VariableExpression | null;
    readonly methods: FunctionStatement[];

    constructor(name: Token, superclass: VariableExpression | null, methods: FunctionStatement[]) {
        super();
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }

    accept(v: StatementVisitor) {
        return v.visitForClassStatement(this);
    }
}