import { BinaryExpression } from "./BinaryExpression";
import { Expression, ExpressionVisitor } from "./Expression";
import { GroupingExpression } from "./GroupingExpression";
import { LiteralExpression } from "./LiteralExpression";
import { UnaryExpression } from "./UnaryExpression";
import { VariableExpression } from "./VariableExpression";

export class AstPrinter implements ExpressionVisitor {
 
    print(expression: Expression) : string {
        return expression.accept(this)
    }

    visitForBinaryExpression(be: BinaryExpression) : string {
        return this.parenthesize(be.operator.lexeme, [be.left, be.right]);
    }

    visitForGroupingExpression(ge: GroupingExpression) : string {
        return this.parenthesize("Group", [ge.expression]);
    }
    
    visitForLiteralExpression(le: LiteralExpression) : string {
        return le.value.toString();
    }

    visitForVariableExpression(ve: VariableExpression) {
        return ve.toString();
    }
    
    visitForUnaryExpression(ue: UnaryExpression) : string {
        return this.parenthesize(ue.operator.lexeme, [ue.right]);
    }

    parenthesize(name:string, expressions:Expression[]) {
        let str = `(${name}`;
        for(const exp of expressions) {
            str += " ";
            str += exp.accept(this);
        }
        str += ")";
        return str;
    }

}