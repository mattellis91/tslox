import { BlockStatement } from "./BlockStatement";
import { ExpressionStatement } from "./ExpressionStatement";
import { FunctionStatement } from "./FunctionStatement";
import { IfStatement } from "./IfStatement";
import { PrintStatement } from "./PrintStatement";
import { ReturnStatement } from "./ReturnStatement";
import { VariableStatement } from "./VariableStatement";
import { WhileStatement } from "./WhileStatement";
import { ClassStatement } from "./ClassStatement";

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
    visitForFunctionStatement(fs: FunctionStatement) : any
    visitForReturnStatement(rs: ReturnStatement) : any
    visitForClassStatement(cs: ClassStatement) : any
}