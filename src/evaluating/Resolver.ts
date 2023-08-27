import { Token } from "../lexing/Token";
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
import { ThisExpression } from "../parsing/ThisExpression";
import { UnaryExpression } from "../parsing/UnaryExpression";
import { VariableExpression } from "../parsing/VariableExpression";
import { VariableStatement } from "../parsing/VariableStatement";
import { WhileStatement } from "../parsing/WhileStatement";
import { Interpreter } from "./Interperter";

enum FunctionType {
    NONE,
    FUNCTION,
    INITIALIZER,
    METHOD
}

enum ClassType {
    NONE,
    CLASS
}

export class Resolver implements ExpressionVisitor, StatementVisitor {
    readonly interpreter: Interpreter;
    readonly scopes: Map<string, boolean>[] = [];
    private currentFunction: FunctionType = FunctionType.NONE;
    private currentClass: ClassType = ClassType.NONE;

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    resolve(statements: Statement[]) {
        for(const statement of statements) {
            this.resolveStatement(statement);
        }
    }

    resolveStatement(statement: Statement) {
        statement.accept(this);
    }

    resolveExpression(expression: Expression) {
        expression.accept(this);
    }

    resolveFunction(fs: FunctionStatement, type: FunctionType) {
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

    resolveLocal(expression: Expression, name: Token) {
        for(let i = this.scopes.length - 1; i >= 0; i--) {
            if(this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expression, this.scopes.length - 1 - i);
                return;
            }
        }
    }
    
    visitForBlockStatement(bs: BlockStatement) {
        this.beginScope();
        this.resolve(bs.statements);
        this.endScope();
        return null;
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

    visitForVariableStatement(vs: VariableStatement) {
        this.declare(vs.name);
        if(vs.initializer !== null) {
            this.resolveExpression(vs.initializer);
        }
        this.define(vs.name);
        return null;
    }

    visitForVariableExpression(ve: VariableExpression) {
        if(this.scopes.length > 0 && this.scopes[this.scopes.length - 1].get(ve.name.lexeme) === false) {
            throw new Error("Cannot read local variable in its own initializer.");
        }
        this.resolveLocal(ve, ve.name);
        return null;
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

    visitForClassStatement(cs: ClassStatement) {
        const enclosingClass = this.currentClass;
        this.currentClass = ClassType.CLASS;

        this.declare(cs.name);
        this.define(cs.name);

        if(cs.superclass !== null && cs.name.lexeme === cs.superclass.name.lexeme) {
            throw new Error("A class cannot inherit from itself.");
        }
        
        if(cs.superclass !== null) {
            this.resolveExpression(cs.superclass);
        }

        this.beginScope();
        this.scopes[this.scopes.length - 1].set("this", true);

        for(const method of cs.methods) {
            let declaration = FunctionType.METHOD;

            if(method.name.lexeme === "init") {
                declaration = FunctionType.INITIALIZER;
            }

            this.resolveFunction(method, declaration);
        }

        this.endScope();

        this.currentClass = enclosingClass;

        return null;
    }

    visitForReturnStatement(ps: ReturnStatement) {
        if(this.currentFunction === FunctionType.NONE) {
            throw new Error("Cannot return from top-level code.");
        }
        if(ps.value !== null) {
            if(this.currentFunction === FunctionType.INITIALIZER) {
                throw new Error("Cannot return a value from an initializer.");
            }
            this.resolveExpression(ps.value);
        }
        return null;
    }

    visitForWhileStatement(ws: WhileStatement) {
        this.resolveExpression(ws.condition);
        this.resolveStatement(ws.body);
        return null;
    }

    visitForThisExpression(te: ThisExpression) {

        if(this.currentClass === ClassType.NONE) { 
            throw new Error("Cannot use 'this' outside of a class.");
        }

        this.resolveLocal(te, te.keyword);
        return null;
    }

    visitForBinaryExpression(be: BinaryExpression) {
        this.resolveExpression(be.left);
        this.resolveExpression(be.right);
        return null;
    }

    visitForGetExpression(ge: GetExpression) {
        this.resolveExpression(ge.object);
        return null;
    }

    visitForSetExpression(se: SetExpression) {
        this.resolveExpression(se.value);
        this.resolveExpression(se.object);
        return null;
    }

    visitForCallExpression(ce: CallExpression) {
        this.resolveExpression(ce.callee);
        for(const argument of ce.args) {
            this.resolveExpression(argument);
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

    private declare(name: Token) {
        if(this.scopes.length === 0) return;
        const scope = this.scopes[this.scopes.length - 1];

        if(scope.has(name.lexeme)) {
            throw new Error("Already variable with this name in this scope.");
        }

        scope.set(name.lexeme, false);
    }

    private define(name: Token) {
        if(this.scopes.length === 0) return;
        const scope = this.scopes[this.scopes.length - 1];
        scope.set(name.lexeme, true);
    }

    private beginScope() {
        this.scopes.push(new Map<string, boolean>());
    }

    private endScope() {
        this.scopes.pop();
    }
}