import { BlockStatement } from "./BlockStatement";
import { ExpressionStatement } from "./ExpressionStatement";
import { IfStatement } from "./IfStatement";
import { PrintStatement } from "./PrintStatement";
import { VariableStatement } from "./VariableStatement";
import { WhileStatement } from "./WhileStatement";

export abstract class Statement {
    abstract accept(v: StatementVisitor) : any;
}

export interface StatementVisitor {
    visitForPrintStatement(ps: PrintStatement) : any;
    visitForExpressionStatement(es: ExpressionStatement) : any;
    visitForVariableStatement(vs: VariableStatement) : any
    visitForBlockStatement(bs: BlockStatement) : any
    visitForIfStatement(is: IfStatement) : any
    visitForWhileStatement(ws: WhileStatement) : any
}