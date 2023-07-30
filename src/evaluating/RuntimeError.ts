import { Token } from "../lexing/Token";

export class RuntimeError extends Error {
    readonly token:Token | null;

    constructor(token:Token | null, message:string) {
        super(message);
        this.token = token;
    }
}