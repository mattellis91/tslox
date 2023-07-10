import { ExpressionStatement } from "./ExpressionStatement";
import { PrintStatement } from "./PrintStatement";

export abstract class Statement {
    abstract accept(v: StatementVisitor) : any;
}

export interface StatementVisitor {
    visitForPrintStatement(ps: PrintStatement) : any;
    visitForExpressionStatement(es: ExpressionStatement) : any;
}