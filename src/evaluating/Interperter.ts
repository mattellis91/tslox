import { TsLox } from "../TsLox";
import { Token } from "../lexing/Token";
import { TokenType } from "../lexing/TokenType";
import { BinaryExpression } from "../parsing/BinaryExpression";
import { Expression, Visitor } from "../parsing/Expression";
import { GroupingExpression } from "../parsing/GroupingExpression";
import { LiteralExpression } from "../parsing/LiteralExpression";
import { UnaryExpression } from "../parsing/UnaryExpression";
import { RuntimeError } from "./RuntimeError";

export class Interpreter implements Visitor {

    interpret(expression: Expression) {
        try {
            const value = this.evaluate(expression);
            console.log(this.stringify(value));
        } catch (e) {
            TsLox.runtimeError(e);
        }
    }

    private stringify(value: any) : string {
        if(this.isNullish(value)) return 'nil';
        if(typeof value === 'number') {
            let text = value.toString();
            if(text.endsWith('.0')) {
                text = text.substring(0, text.length - 2);
            }
            return text;
        }

        return value.toString();
    }

    visitForLiteralExpression(le: LiteralExpression) : any {
         return le.value;
    }

    visitForGroupingExpression(ge: GroupingExpression) : any {
        return this.evaluate(ge.expression);
    }

    visitForUnaryExpression(ue: UnaryExpression) : any {
        const right = this.evaluate(ue.right);

        switch(ue.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperand(ue.operator, right);
                return -Math.abs(right);
            case TokenType.BANG:
                return !this.isTruthy(right);
        }

        return null;
    }

    visitForBinaryExpression(be: BinaryExpression) : any {
        const left = this.evaluate(be.left);
        const right = this.evaluate(be.right);

        switch(be.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) - Number(right);
            case TokenType.SLASH:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) / Number(right);
            case TokenType.STAR:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) * Number(right);
            case TokenType.PLUS:
                //TODO: operands check inside ifs is redundant
                if(typeof left === 'number' && typeof right === 'number') {
                    this.checkNumberOperands(be.operator, left, right);
                    return Number(left) + Number(right);
                } 

                if(typeof left === 'string' && typeof right === 'string') {
                    this.checkStringOperands(be.operator, left, right);
                    return String(left) + String(right);
                }
                break; 
            case TokenType.GREATER:
                return Number(left) > Number(right);
            case TokenType.GREATER_EQUAL:
                return Number(left) >= Number(right);
            case TokenType.LESS:
                return Number(left) < Number(right);
            case TokenType.LESS_EQUAL:
                return Number(left) <= Number(right);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
            
        }

        return null;
    }

    private evaluate(expression: Expression) : any{
        return expression.accept(this);
    }

    private isTruthy(val: any) : boolean {
        if(this.isNullish(val)) return false;
        if(typeof val === 'boolean') return Boolean(val);
        return true;
    }

    private isEqual(a:any, b:any) : boolean {
        if(this.isNullish(a) && this.isNullish(b)) return true;
        if(this.isNullish(a)) return false;
        return a === b;
    }

    private checkNumberOperand(operator:Token, operand:any) {
        if(typeof operand === 'number') return;
        throw new RuntimeError(operator, "Operand must be a number");
    }

    private checkNumberOperands(operator:Token, left:any, right:any) {
        if(typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeError(operator, "Operands must be numbers");
    }

    private checkStringOperands(operator:Token, left:any, right:any) {
        if(typeof left === 'string' && typeof right === 'string') return;
        throw new RuntimeError(operator, "Operands must be strings");
    }

    private isNullish(value:any) {
        return [null, undefined].includes(value);
    }
}