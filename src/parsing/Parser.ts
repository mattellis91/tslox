import { error } from "console";
import { Token } from "../lexing/Token";
import { TokenType } from "../lexing/TokenType";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { GroupingExpression } from "./GroupingExpression";
import { LiteralExpression } from "./LiteralExpression";
import { UnaryExpression } from "./UnaryExpression";
import { TsLox } from "../TsLox";
import { Statement } from "./Statement";
import { PrintStatement } from "./PrintStatement";
import { ExpressionStatement } from "./ExpressionStatement";
import { VariableStatement } from "./VariableStatement";
import { VariableExpression } from "./VariableExpression";
import { AssignmentExpression } from "./AssignmentExpression";
import { BlockStatement } from "./BlockStatement";
import { IfStatement } from "./IfStatement";
import { LogicalExpression } from "./LogicalExpression";
import { WhileStatement } from "./WhileStatement";
import { CallExpression } from "./CallExpression";
import { FunctionStatement } from "./FunctionStatement";
import { ReturnStatement } from "./ReturnStatement";
import { ClassStatement } from "./ClassStatement";
import { GetExpression } from "./GetExpression";
import { SetExpression } from "./SetExpression";
import { ThisExpression } from "./ThisExpression";

export class Parser {
    private readonly tokens:Token[];
    private current: number = 0;

    constructor(tokens:Token[]) {
        this.tokens = tokens;
    }

    parse() : Statement[] {
        const statements:Statement[] = [];
        try {
            while(!this.isAtEnd()) {
                const v = this.declaration();
                if(v)  {
                    statements.push(v as unknown as Statement);
                }
            }
            return statements;
        } catch (e) {
            return [];
        }
    }

    private declaration() : Statement | null{
        try {

            if(this.match([TokenType.CLASS])) {
                return this.classDeclaration();
            }

            if(this.match([TokenType.FUN])) {
                return this.function("function");
            }

            if(this.match([TokenType.VAR])) {
                return this.varDeclaration();
            }

            return this.statement();
        } catch (e) {
            this.synchronize();
            return null;
        }
    }

    private classDeclaration() : Statement {
        const name = this.consume(TokenType.IDENTIFIER, "Expect class name.");

        let superclass = null;
        if(this.match([TokenType.LESS])) {
            this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
            superclass = new VariableExpression(this.previous());
        }

        this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

        const methods:FunctionStatement[] = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.function("method"));
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

        return new ClassStatement(name, superclass, methods);
    }

    private function(kind:string) : FunctionStatement {
        const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
        this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        const parameters:Token[] = [];
        if(!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if(parameters.length >= 255) {
                    this.error(this.peek(), "Can't have more than 255 parameters.");
                }

                parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while(this.match([TokenType.COMMA]));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);
        const body = this.block();
        return new FunctionStatement(name, parameters, body);
    }

    private varDeclaration() : Statement {
        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name.");
        let initializer = null;
        if(this.match([TokenType.EQUAL])) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration.");
        return new VariableStatement(name, initializer);
    }

    private whileStatement() : Statement {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
        const body = this.statement();

        return new WhileStatement(condition, body);
    }

    private statement() : Statement {

        if(this.match([TokenType.FOR])) {
            return this.forStatement();
        }
        
        if(this.match([TokenType.IF])) {
            return this.ifStatement();
        }
        
        if(this.match([TokenType.PRINT])) {
            return this.printStatement();
        }

        if(this.match([TokenType.RETURN])) {
            return this.returnStatement();
        }

        if(this.match([TokenType.WHILE])) {
            return this.whileStatement();
        }

        if(this.match([TokenType.LEFT_BRACE])) {
            return new BlockStatement(this.block());
        }

        return this.expressionStatement();
    }

    private forStatement() : Statement {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

        let initializer = null;
        if(this.match([TokenType.SEMICOLON])) {
            initializer = null;
        } else if(this.match([TokenType.VAR])) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        let condition = null;
        if(!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment = null;
        if(!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        let body = this.statement();
        
        if(increment) {
            body = new BlockStatement([body, new ExpressionStatement(increment)]);
        }

        if(!condition) {
            condition = new LiteralExpression(true);
        }

        body = new WhileStatement(condition, body);

        if(initializer) {
            body = new BlockStatement([initializer, body]);
        }

        return body;
    }

    private block() : Statement[] {
        const statements:Statement[] = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration() as unknown as Statement);    
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }

    private assignment() : Expression {
        const expression = this.or();

        if(this.match([TokenType.EQUAL])) {
            const equals = this.previous();
            const value = this.assignment();

            if(expression instanceof VariableExpression) {
                const name = (expression as VariableExpression).name;
                return new AssignmentExpression(name, value);
            } else if(expression instanceof GetExpression) {
                const get = expression as GetExpression;
                return new SetExpression(get.object, get.name, value);
            }

            this.error(equals, "Invalid assignment target");
        }

        return expression;
    }

    private or() : Expression {
        let expression = this.and();

        while(this.match([TokenType.OR])) {
            const operator = this.previous();
            const right = this.and();
            expression = new LogicalExpression(expression, operator, right);
        }

        return expression
    }

    private and() : Expression {
        let expression = this.equality();

        while(this.match([TokenType.AND])) {
            const operator = this.previous();
            const right = this.equality();
            expression = new LogicalExpression(expression, operator, right);
        }

        return expression;
    }

    private expressionStatement() : Statement {
        const expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value");
        return new ExpressionStatement(expression);
    }

    private printStatement() : Statement {
        const value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new PrintStatement(value);
    }

    private returnStatement() : Statement {
        const keyword = this.previous();
        let value = null;
        if(!this.check(TokenType.SEMICOLON)) {
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
        return new ReturnStatement(keyword, value);
    }

    private ifStatement() : Statement {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch = this.statement();
        let elseBranch = null;
        if(this.match([TokenType.ELSE])) {
            elseBranch = this.statement();
        }

        return new IfStatement(condition, thenBranch, elseBranch);
    }

    private expression() : Expression {
        return this.assignment();
    }

    private equality() : Expression {
        let expression = this.comparison();

        while(this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
            const operator = this.previous();
            const right = this.comparison();
            expression = new BinaryExpression(expression, operator, right); 
        }

        return expression;
    }

    private comparison() : Expression {
        let expression = this.term();
        while(this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
            const operator = this.previous();
            const right = this.term();
            expression = new BinaryExpression(expression, operator, right);
        }

        return expression;
    }

    private term() : Expression {
        let expression = this.factor();

        while(this.match([TokenType.MINUS, TokenType.PLUS])) {
            const operator = this.previous();
            const right = this.factor();
            expression = new BinaryExpression(expression, operator, right); 
        }

        return expression;
    }

    private factor() : Expression {
        let expression = this.unary();

        while(this.match([TokenType.SLASH, TokenType.STAR])) {
            const operator = this.previous();
            const right = this.unary();
            expression = new BinaryExpression(expression, operator, right);
        }

        return expression;
    }

    private unary() : Expression {
        if(this.match([TokenType.BANG, TokenType.MINUS])) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpression(operator, right);
        }

        return this.call();
    }

    private call() : Expression {
        let expression = this.primary();

        while(true) {
            if(this.match([TokenType.LEFT_PAREN])) {
                expression = this.finishCall(expression);
            } else if(this.match([TokenType.DOT])) {
                const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expression = new GetExpression(expression, name);
            } else {
                break;
            }
        }

        return expression;
    }

    private finishCall(callee:Expression) : Expression {
        const args:Expression[] = [];
        if(!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if(args.length >= 255) {
                    this.error(this.peek(), "Can't have more than 255 arguments");
                }
                args.push(this.expression());
            } while(this.match([TokenType.COMMA]));
        }

        const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments");

        return new CallExpression(callee, paren, args);
    }

    private primary() : Expression {
        if(this.match([TokenType.FALSE])) return new LiteralExpression(false);
        if(this.match([TokenType.TRUE])) return new LiteralExpression(true);
        if(this.match([TokenType.NIL])) return new LiteralExpression(null);

        if(this.match([TokenType.NUMBER, TokenType.STRING])) {
            return new LiteralExpression(this.previous().literal);
        }

        if(this.match([TokenType.THIS])) return new ThisExpression(this.previous());
        if(this.match([TokenType.IDENTIFIER])) return new VariableExpression(this.previous());

        if(this.match([TokenType.LEFT_PAREN])) {
            const expression = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
            return new GroupingExpression(expression);
        }

        throw this.error(this.peek(), "Expected expression");
    }

    private consume(type: TokenType, message:string) {
        if(this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token:Token, message:string) : Error {
        TsLox.errorToken(token, message);
        return new Error(message);
    }

    private match(types: TokenType[]) : boolean {
        for(const type of types) {
            if(this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    } 

    private synchronize() {
        this.advance();

        while(!this.isAtEnd()) {
            if(this.previous().type === TokenType.SEMICOLON) return;

            switch(this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }

    private check(type: TokenType) : boolean {
        if(this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance() : Token {
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd() : boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek() : Token {
        return this.tokens[this.current];
    }

    private previous() : Token {
        return this.tokens[this.current - 1];
    }
}
