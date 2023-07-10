import { BinaryExpression } from "./BinaryExpression"
import { GroupingExpression } from "./GroupingExpression"
import { LiteralExpression } from "./LiteralExpression"
import { UnaryExpression } from "./UnaryExpression"

export abstract class Expression { 
    abstract toString() : string; 
    abstract accept(v: ExpressionVisitor) : any;
}

export interface ExpressionVisitor {
    visitForBinaryExpression(be: BinaryExpression) : any
    visitForGroupingExpression(ge: GroupingExpression) : any
    visitForLiteralExpression(le: LiteralExpression) : any
    visitForUnaryExpression(ue: UnaryExpression) : any
}