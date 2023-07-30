import { RuntimeError } from "./RuntimeError";

export class Return extends RuntimeError {
    readonly value:any;
    constructor(value:any) {
        super(null, '');
        this.value = value;
    }
}