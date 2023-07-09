import { error } from "console";
import { Token } from "../lexing/Token";
import { TokenType } from "../lexing/TokenType";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";
import { GroupingExpression } from "./GroupingExpression";
import { LiteralExpression } from "./LiteralExpression";
import { UnaryExpression } from "./UnaryExpression";
import { TsLox } from "../TsLox";

export class Parser {
    private readonly tokens:Token[];
    private current: number = 0;

    constructor(tokens:Token[]) {
        this.tokens = tokens;
    }

    parse() : Expression | null {
        try {
            return this.expression();
        } catch (e) {
            return null;
        }
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
