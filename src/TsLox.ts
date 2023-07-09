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

export class TsLox {

    static hadError:boolean = false;

    main(args:string[]) {
        console.log(args);
        if(args.length > 3) {
            console.log("Usage: tslox [script]");
        } else if(args.length === 3) {
            this.runFile(args[2]);
        } else {
            this.runRepl();
        }
    }

    runFile(path:string) {
        console.log(path);
        try {
            const f = readFileSync(path, 'utf-8');
            
            const tokens = new Scanner(f.toString()).scanTokens();
            const parsed = new Parser(tokens).parse();

            if(TsLox.hadError) {
                return;
            }

            console.log(parsed ? new AstPrinter().print(parsed) : 'failed to parse');

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
}