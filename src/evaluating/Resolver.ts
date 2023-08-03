import { Token } from "../lexing/Token";
import { AssignmentExpression } from "../parsing/AssignmentExpression";
import { BinaryExpression } from "../parsing/BinaryExpression";
import { BlockStatement } from "../parsing/BlockStatement";
import { CallExpression } from "../parsing/CallExpression";
import { Expression, ExpressionVisitor } from "../parsing/Expression";
import { ExpressionStatement } from "../parsing/ExpressionStatement";
import { FunctionStatement } from "../parsing/FunctionStatement";
import { GroupingExpression } from "../parsing/GroupingExpression";
import { IfStatement } from "../parsing/IfStatement";
import { LiteralExpression } from "../parsing/LiteralExpression";
import { LogicalExpression } from "../parsing/LogicalExpression";
import { PrintStatement } from "../parsing/PrintStatement";
import { ReturnStatement } from "../parsing/ReturnStatement";
import { Statement, StatementVisitor } from "../parsing/Statement";
import { UnaryExpression } from "../parsing/UnaryExpression";
import { VariableExpression } from "../parsing/VariableExpression";
import { VariableStatement } from "../parsing/VariableStatement";
import { WhileStatement } from "../parsing/WhileStatement";
import { FunctionType } from "./FunctionType";
import { Interpreter } from "./Interperter";

export class Resolver implements ExpressionVisitor, StatementVisitor {
    readonly interpreter: Interpreter;
    readonly scopes: Map<string, boolean>[] = [];
    private currentFunction: FunctionType = FunctionType.NONE;

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    visitForBlockStatement(bs: BlockStatement) {
        this.beginScope();
        this.resolve(bs.statements);
        this.endScope();
        return null;
    }

    visitForVariableStatement(vs: VariableStatement) {
        this.declare(vs.name);
        if(vs.initializer !== null) {
            this.resolveExpression(vs.initializer);
        }
        this.define(vs.name);
        return null;
    }

    visitForVariableExpression(ve: VariableExpression) {
        if(this.scopes.length > 0) {
            const scope:Map<string, boolean> = this.scopes[this.scopes.length - 1];
            if(scope.get(ve.name.lexeme) === false) {
                throw new Error(`Cannot read local variable in its own initializer.`);
            }
        }
        this.resolveLocal(ve, ve.name);
        return null;
    }

    resolve(statements: Statement[]) {
        for(const statement of statements) {
            this.resolveStatement(statement);
        }
    }

    private resolveLocal(expression: Expression, name: Token) {
        for(let i = this.scopes.length - 1; i >= 0; i--) {
            const scope:Map<string, boolean> = this.scopes[i];
            if(scope.has(name.lexeme)) {
                this.interpreter.resolve(expression, this.scopes.length - 1 - i);
                return;
            }
        }
    }

    visitForAssignmentExpression(ae: AssignmentExpression) {
        this.resolveExpression(ae.value);
        this.resolveLocal(ae, ae.name);
        return null;
    }

    visitForFunctionStatement(fs: FunctionStatement) {
        this.declare(fs.name);
        this.define(fs.name);
        this.resolveFunction(fs, FunctionType.FUNCTION);
        return null;
    }

    private resolveFunction(fs: FunctionStatement, type: FunctionType) {
        const enclosingFunction = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for(const param of fs.params) {
            this.declare(param);
            this.define(param);
        }
        this.resolve(fs.body);
        this.endScope();
        this.currentFunction = enclosingFunction;
    }

    visitForExpressionStatement(es: ExpressionStatement) {
        this.resolveExpression(es.expression);
        return null;
    }

    visitForIfStatement(is: IfStatement) {
        this.resolveExpression(is.condition);
        this.resolveStatement(is.thenBranch);
        if(is.elseBranch !== null) {
            this.resolveStatement(is.elseBranch);
        }
        return null;
    }

    visitForPrintStatement(ps: PrintStatement) {
        this.resolveExpression(ps.expression);
        return null;
    }

    visitForReturnStatement(rs: ReturnStatement) {
        if(this.currentFunction === FunctionType.NONE) {
            throw new Error(`Cannot return from top-level code.`);
        }
        if(rs.value !== null) {
            this.resolveExpression(rs.value);
        }
        return null;
    }
    
    visitForWhileStatement(ws: WhileStatement) {
        this.resolveExpression(ws.condition);
        this.resolveStatement(ws.body);
        return null;
    }

    visitForBinaryExpression(be: BinaryExpression) {
        this.resolveExpression(be.left);
        this.resolveExpression(be.right);
        return null;
    }

    visitForCallExpression(ce: CallExpression) {
        this.resolveExpression(ce.callee);
        for(const arg of ce.args) {
            this.resolveExpression(arg);
        }
        return null;
    }

    visitForGroupingExpression(ge: GroupingExpression) {
        this.resolveExpression(ge.expression);
        return null;
    }

    visitForLiteralExpression(le: LiteralExpression) {
        return null;
    }

    visitForLogicalExpression(le: LogicalExpression) {
        this.resolveExpression(le.left);
        this.resolveExpression(le.right);
        return null;
    }

    visitForUnaryExpression(ue: UnaryExpression) {
        this.resolveExpression(ue.right);
        return null;
    }

    private resolveStatement(statement: Statement) {
        statement.accept(this);
    }

    private resolveExpression(expression: Expression) {
        expression.accept(this);
    }

    private beginScope() {
        this.scopes.push(new Map<string, boolean>());
    }

    private endScope() {
        this.scopes.pop();
    }

    private declare(name: Token) {
        if(this.scopes.length === 0) return;
        const scope:Map<string, boolean> = this.scopes[this.scopes.length - 1];
        if(scope.has(name.lexeme)) {
            throw new Error(`Variable with this name already declared in this scope.`);
        }
        scope.set(name.lexeme, false);
    }

    private define(name: Token) {
        if(this.scopes.length === 0) return;
        const scope:Map<string, boolean> = this.scopes[this.scopes.length - 1];
        scope.set(name.lexeme, true);
    }
}