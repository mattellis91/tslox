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
            if(this.match([TokenType.VAR])) {
                return this.varDeclaration();
            }

            return this.statement();
        } catch (e) {
            this.synchronize();
            return null;
        }
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

    private statement() : Statement {
        if(this.match([TokenType.PRINT])) {
            return this.printStatement();
        }

        return this.expressionStatement();
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

    private expression() : Expression {
        return this.equality();
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

        return this.primary();
    }

    private primary() : Expression {
        if(this.match([TokenType.FALSE])) return new LiteralExpression(false);
        if(this.match([TokenType.TRUE])) return new LiteralExpression(true);
        if(this.match([TokenType.NIL])) return new LiteralExpression(null);

        if(this.match([TokenType.NUMBER, TokenType.STRING])) {
            return new LiteralExpression(this.previous().literal);
        }

        
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
