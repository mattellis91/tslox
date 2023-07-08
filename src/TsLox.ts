import { readFileSync } from "fs";
import readline from "readline";
import { Scanner } from "./Scanner";
import { BinaryExpression } from "./lexing/BinaryExpression";
import { UnaryExpression } from "./lexing/UnaryExpression";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { LiteralExpression } from "./lexing/LiteralExpression";
import { Expression } from "./lexing/Expression";
import { GroupingExpression } from "./lexing/GroupingExpression";
import { AstPrinter } from "./lexing/AstPrinter";

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
            //console.log(f.toString());
            console.log(new Scanner(f.toString()).scanTokens());

            const exp = new BinaryExpression(
                new UnaryExpression(
                    new Token(TokenType.MINUS, '-', null, 1),
                    new LiteralExpression(123)
                ),
                new Token(TokenType.STAR, "*", null, 1),
                new GroupingExpression(
                    new LiteralExpression(25.67)
                )
            );

            console.log(new AstPrinter().print(exp));

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

    static report(line:number, where:string, message:string) {
        console.log(`[line ${line} ] Error ${where} : ${message}`);
        this.hadError = true;
    }
}