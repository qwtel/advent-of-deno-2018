// OPERATORS

export function map(f) {
    return async function* (xs) {
        for await (const x of xs) yield f(x);
    }
}

export function tap(f) {
    return async function* (xs) {
        for await (const x of xs) {
            f(x);
            yield x;
        }
    }
}

export const inspect = tap;

export function forEach(f) {
    return async function* (xs) {
        for await (const x of xs) {
            f(x);
        }
    }
}

export const subscribe = forEach;

export function reduce(f, init) {
    return async function (xs) {
        let res = init;
        for await (const x of xs) {
            res = f(res, x);
        }
        return res;
    }
}

export function scan(f, init) {
    return async function* (xs) {
        let res = init;
        for await (const x of xs) {
            res = f(res, x);
            yield res;
        }
    }
}

export const reducutions = scan;

// TODO: other operators
