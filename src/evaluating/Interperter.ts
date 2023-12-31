import { TsLox } from "../TsLox";
import { Token } from "../lexing/Token";
import { TokenType } from "../lexing/TokenType";
import { AssignmentExpression } from "../parsing/AssignmentExpression";
import { BinaryExpression } from "../parsing/BinaryExpression";
import { BlockStatement } from "../parsing/BlockStatement";
import { CallExpression } from "../parsing/CallExpression";
import { ClassStatement } from "../parsing/ClassStatement";
import { Expression, ExpressionVisitor } from "../parsing/Expression";
import { ExpressionStatement } from "../parsing/ExpressionStatement";
import { FunctionStatement } from "../parsing/FunctionStatement";
import { GetExpression } from "../parsing/GetExpression";
import { GroupingExpression } from "../parsing/GroupingExpression";
import { IfStatement } from "../parsing/IfStatement";
import { LiteralExpression } from "../parsing/LiteralExpression";
import { LogicalExpression } from "../parsing/LogicalExpression";
import { PrintStatement } from "../parsing/PrintStatement";
import { ReturnStatement } from "../parsing/ReturnStatement";
import { SetExpression } from "../parsing/SetExpression";
import { Statement, StatementVisitor } from "../parsing/Statement";
import { SuperExpression } from "../parsing/SuperExpression";
import { ThisExpression } from "../parsing/ThisExpression";
import { UnaryExpression } from "../parsing/UnaryExpression";
import { VariableExpression } from "../parsing/VariableExpression";
import { VariableStatement } from "../parsing/VariableStatement";
import { WhileStatement } from "../parsing/WhileStatement";
import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { LoxClass } from "./LoxClass";
import { LoxFunction } from "./LoxFunction";
import { LoxInstance } from "./LoxInstance";
import { Return } from "./Return";
import { RuntimeError } from "./RuntimeError";

export class Interpreter implements ExpressionVisitor, StatementVisitor {

    readonly globals:Environment = new Environment();
    private environment:Environment = this.globals;
    readonly locals: Map<Expression, number> = new Map();

    constructor() {
        this.globals.define("clock", new Object({
            arity() { return 0; },
            call(interpreter: Interpreter, args: any[]) {
                return Date.now() / 1000;
            }
        }));
    }

    resolve(expression:Expression, depth:number) {
        this.locals.set(expression, depth);
    }

    interpret(statements: Statement[]) {
        try {
            for(const statement of statements) {
                this.execute(statement);
            }
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

    visitForAssignmentExpression(ae: AssignmentExpression) {
        const value = this.evaluate(ae.value);
        const distance = this.locals.get(ae);
        if(distance !== undefined) {
            this.environment.assignAt(distance, ae.name, value);
        } else {
            this.globals.assign(ae.name, value);
        }
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
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) > Number(right);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) >= Number(right);
            case TokenType.LESS:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) < Number(right);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(be.operator, left, right);
                return Number(left) <= Number(right);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
            
        }

        return null;
    }

    visitForCallExpression(ce: CallExpression) {
        const callee = this.evaluate(ce.callee);

        const args = [];
        for(const arg of ce.args) {
            args.push(this.evaluate(arg));
        }

        // if(!('call' in callee)) {
        //     throw new RuntimeError(ce.paren, "Can only call functions and classes.");
        // }

        const func = callee as Callable;
        if(args.length !== func.arity()) {
            throw new RuntimeError(ce.paren, `Expected ${func.arity()} arguments but got ${args.length}.`);
        }

        return func.call(this, args);
    }

    visitForVariableExpression(ve: VariableExpression) {
        return this.lookUpVariable(ve.name, ve);
    }

    lookUpVariable(name:Token, expression:Expression) {
        const distance = this.locals.get(expression);
        if(distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }

    visitForExpressionStatement(es: ExpressionStatement) {
        this.evaluate(es.expression);
    }

    visitForFunctionStatement(fs: FunctionStatement) {
        const func = new LoxFunction(fs, this.environment, false);
        this.environment.define(fs.name.lexeme, func);
    }

    visitForClassStatement(cs: ClassStatement) {

        let superclass = null;
        if(cs.superclass !== null) {
            superclass = this.evaluate(cs.superclass);
            if(!(superclass instanceof LoxClass)) {
                throw new RuntimeError(cs.superclass.name, "Superclass must be a class.");
            }
        }

        this.environment.define(cs.name.lexeme, null);

        if(cs.superclass !== null) {
            this.environment = new Environment(this.environment);
            this.environment.define("super", superclass);
        }

        const methods = new Map<string, LoxFunction>();
        for(const method of cs.methods) {
            const func = new LoxFunction(method, this.environment, method.name.lexeme === 'init');
            methods.set(method.name.lexeme, func);
        }

        const lClass = new LoxClass(cs.name.lexeme, superclass, methods);

        if(superclass !== null) {
            this.environment = this.environment.enclosing!;
        }

        this.environment.assign(cs.name, lClass);
        return null;
    }

    visitForPrintStatement(ps: PrintStatement) {
        const value = this.evaluate(ps.expression);
        console.log(this.stringify(value));
    }

    visitForReturnStatement(rs: ReturnStatement) {
        let value = null;
        if(rs.value !== null) {
            value = this.evaluate(rs.value);
        }

        throw new Return(value);
    }

    visitForSuperExpression(se: SuperExpression) {
        const distance = this.locals.get(se)
        const superclass = this.environment.getAt(distance!, "super") as LoxClass;
        const object = this.environment.getAt(distance! - 1, "this") as LoxInstance;
        const method = superclass.findMethod(se.method.lexeme);

        if(method === null) {
            throw new RuntimeError(se.method, `Undefined property '${se.method.lexeme}'.`);
        }

        return method!.bind(object);
    }

    visitForLogicalExpression(le: LogicalExpression) {
        const left = this.evaluate(le.left);

        if(le.operator.type === TokenType.OR) {
            if(this.isTruthy(left)) { 
                return left; 
            }
        } else {
            if(!this.isTruthy(left)) {
                return left;
            }
        }

        return this.evaluate(le.right);
    }

    visitForGetExpression(ge: GetExpression) {
        const object = this.evaluate(ge.object);
        if(object instanceof LoxInstance) {
            return object.get(ge.name);
        }

        throw new RuntimeError(ge.name, "Only instances have properties.");
    }

    visitForSetExpression(se: SetExpression) {
        const object = this.evaluate(se.object);

        if(!(object instanceof LoxInstance)) {
            throw new RuntimeError(se.name, "Only instances have fields.");
        }

        const value = this.evaluate(se.value);
        object.set(se.name, value);
        return value;
    }

    visitForThisExpression(te: ThisExpression) {
        return this.lookUpVariable(te.keyword, te);
    }

    visitForIfStatement(is: IfStatement) {
        if(this.isTruthy(this.evaluate(is.condition))) {
            this.execute(is.thenBranch);
        } else if(is.elseBranch !== null) {
            this.execute(is.elseBranch);
        }
        return null;
    }

    visitForWhileStatement(ws: WhileStatement) {
        while(this.isTruthy(this.evaluate(ws.condition))) {
            this.execute(ws.body);
        }
        return null;
    }

    visitForBlockStatement(bs: BlockStatement) {
        this.executeBlock(bs.statements, new Environment(this.environment));
    }

    visitForVariableStatement(vs: VariableStatement) {
        let value = null;
        if(vs.initializer !== null) {
            value = this.evaluate(vs.initializer);
        }

        this.environment.define(vs.name.lexeme, value);
        return null;
    }

    private evaluate(expression: Expression) : any{
        return expression.accept(this);
    }

    private execute(statement: Statement) {
        statement.accept(this);
    }

    private executeBlock(statements: Statement[], environment: Environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            for(const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
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