import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { TsLox } from "./TsLox";

export class Scanner {
    private readonly source:string;
    private readonly tokens:Token[] = [];
    private start:number = 0;
    private current:number = 0;
    private line:number = 1;

    private static readonly KEYWORDS:Record<string, TokenType> = {
        'and': TokenType.AND,
        'class': TokenType.CLASS,
        'else': TokenType.ELSE,
        'false': TokenType.FALSE,
        'for': TokenType.FOR,
        'fun': TokenType.FUN,
        'if': TokenType.IF,
        'nil': TokenType.NIL,
        'or': TokenType.OR,
        'print': TokenType.PRINT,
        'return': TokenType.RETURN,
        'super': TokenType.SUPER,
        'this': TokenType.THIS,
        'var': TokenType.VAR,
        'while': TokenType.WHILE
    }

    constructor(source:string) {
        this.source = source;
    }

    scanTokens() : Token[] {
        while(!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    private scanToken(){
        const c = this.advance();
        switch(c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if(this.match('/')) {
                    while(this.peek() !== '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '"': this.string(); break;
            default:
                if(this.isDigit(c)) {
                    this.number();
                } else if(this.isAlpha(c)) {
                    this.identifier();
                } else {
                    TsLox.error(this.line, "Unexpected character");
                }
                break;
        }
    }

    private advance() : string {
        return this.source[this.current++];
    }
    
    private addToken(type: TokenType, literal?:any) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal !== undefined ? literal : null, this.line));
    }

    private match(expected:string) : boolean {
        if(this.isAtEnd())  return false; 
        if(this.source[this.current] !== expected) return false; 

        this.current++;
        return true;

    }

    private peek() : string {
        if(this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private peekNext() : string {
        if(this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private string() {
        while(this.peek() != '"' && !this.isAtEnd()) {
            if(this.peek() == '\n') this.line++;
            this.advance();
        }

        if(this.isAtEnd()) {
            TsLox.error(this.line, "Unterminated string.");
            return;
        }

        this.advance();

        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private number() {
        while(this.isDigit(this.peek())) this.advance();

        if(this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance();
        
            while(this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER, Number.parseFloat(this.source.substring(this.start, this.current)));
    }

    private identifier() {
        while(this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        let type = Scanner.KEYWORDS[text];
        if(type == undefined) {
            type = TokenType.IDENTIFIER;
        }
        this.addToken(type);
    }

    private isDigit(c: string) : boolean {
        const charCode = c.charCodeAt(0);
        return charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0);
    }

    private isAlpha(c: string) : boolean {
        const charCode = c.charCodeAt(0);
        return charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0) ||
               charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0) ||
               c == '_';

    }

    private isAlphaNumeric(c: string) : boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private isAtEnd() : boolean {
        return this.current >= this.source.length;
    }
}