import { readFileSync } from "fs";
import readline from "readline";
import { Scanner } from "./lexing/Scanner";
import { BinaryExpression } from "./parsing/BinaryExpression";
import { UnaryExpression } from "./parsing/UnaryExpression";
import { Token } from "./lexing/Token";
import { TokenType } from "./lexing/TokenType";
import { LiteralExpression } from "./parsing/LiteralExpression";
import { GroupingExpression } from "./parsing/GroupingExpression";
import { AstPrinter } from "./parsing/AstPrinter";
import { Parser } from "./parsing/Parser";
import { exit } from "process";
import { RuntimeError } from "./evaluating/RuntimeError";
import { Interpreter } from "./evaluating/Interperter";
import { Resolver } from "./evaluating/Resolver";

export class TsLox {

    static hadError:boolean = false;
    static hadRuntimeError:boolean = false;

    main(args:string[]) {
        console.log(args);
        if(args.length > 3) {
            console.log("Usage: tslox [script]");
        } else if(args.length === 3) {
            this.runFile(args[2]);
            console.log("end of file");
        } else {
            this.runRepl();
        }
    }

    runFile(path:string) {
        console.log(path);
        try {
            const f = readFileSync(path, 'utf-8');
            
            const tokens = new Scanner(f.toString()).scanTokens();
            console.log(tokens);
            const statements = new Parser(tokens).parse();
            console.log(statements);
            if(TsLox.hadError) {
                return;
            } 

            const interpreter = new Interpreter();
            const resolver = new Resolver(interpreter);

            if(TsLox.hadError) {
                return;
            }

            if(statements.length) {
                resolver.resolve(statements);
                new Interpreter().interpret(statements)
            }

        } catch (e) {
            console.log(e);
        }
    }

    runRepl() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const waitForUserInput = () => {
            rl.question("Command: ", (answer) => {
            if (answer == "exit"){
                console.log("here");
                rl.close();
                process.exit(0);
            } else {
                waitForUserInput();
            }
            });
        }

        process.on('exit', () => {
            process.kill(process.pid);
        })

        waitForUserInput();
    }

    static error(line:number, message:string) {
        TsLox.report(line, "", message);
    }

    static errorToken(token:Token, message:string) {
        if(token.type === TokenType.EOF) {
            TsLox.report(token.line, " at end", message);
        } else {
            TsLox.report(token.line, " at '" + token.lexeme + "'", message);
        }
    }

    static report(line:number, where:string, message:string) {
        console.log(`[line ${line} ] Error ${where} : ${message}`);
        this.hadError = true;
    }

    static runtimeError(e: RuntimeError) {
        console.log(`${e.message} \n [line ${e.token?.line} ]`);
        TsLox.hadRuntimeError = true;
    }
}