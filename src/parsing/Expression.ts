import { AssignmentExpression } from "./AssignmentExpression"
import { BinaryExpression } from "./BinaryExpression"
import { CallExpression } from "./CallExpression"
import { GetExpression } from "./GetExpression"
import { GroupingExpression } from "./GroupingExpression"
import { LiteralExpression } from "./LiteralExpression"
import { LogicalExpression } from "./LogicalExpression"
import { SetExpression } from "./SetExpression"
import { ThisExpression } from "./ThisExpression"
import { UnaryExpression } from "./UnaryExpression"
import { VariableExpression } from "./VariableExpression"

export abstract class Expression { 
    abstract toString() : string; 
    abstract accept(v: ExpressionVisitor) : any;
}

export interface ExpressionVisitor {
    visitForBinaryExpression(be: BinaryExpression) : any
    visitForGroupingExpression(ge: GroupingExpression) : any
    visitForLiteralExpression(le: LiteralExpression) : any
    visitForUnaryExpression(ue: UnaryExpression) : any
    visitForVariableExpression(ve: VariableExpression) : any
    visitForAssignmentExpression(ae: AssignmentExpression) : any
    visitForLogicalExpression(le: LogicalExpression) : any
    visitForCallExpression(ce: CallExpression) : any
    visitForGetExpression(ge: GetExpression) : any
    visitForSetExpression(se: SetExpression) : any
    visitForThisExpression(te: ThisExpression) : any
}