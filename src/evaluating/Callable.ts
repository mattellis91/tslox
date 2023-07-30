export interface Callable {
    call(interpreter: any, args: any): any;
    arity(): number;
}