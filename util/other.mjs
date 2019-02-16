export function frequencies(iterable) {
    const fs = new Map();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}

export function findAndRemove(arr, f) {
    const i = arr.findIndex(f);
    return i === -1
        ? null
        : arr.splice(i, 1)[0];
}

export function mod(a, n) {
    return ((a % n) + n) % n
}

export function pad(p, char = '0') {
    return n => (new Array(p).fill(char).join('') + n).slice(-p);
}

export function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
}

export function flatten(as) {
    return as.reduce((res, a) => (res.push(...a), res), [])
}

export function* walk2D(arr2D) {
    for (const row of arr2D)
        for (const cell of row)
            yield cell;
}

export function map2D(arr2D, f) {
    return arr2D.map(row => row.map(f));
}

export function arrayCompare(as, bs) {
    const res = as[0] - bs[0];
    if (res === 0 && as.length > 1) {
        return arrayCompare(as.slice(1), bs.slice(1));
    } else {
        return res;
    }
}

export function getIn(keys) {
    return (x) => {
        let r = x;
        for (const k of keys) {
            r = r != null ? r[k] : undefined;
        }
        return r;
    }
}

export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
export const mul = (a, b) => a * b;
export const div = (a, b) => a / b;

export const addN = (a, ...bs) => bs.reduce(add, a);
export const subN = (a, ...bs) => a - addN(...bs);
export const mulN = (a, ...bs) => bs.reduce(mul, a);
export const divN = (a, ...bs) => a / mulN(...bs);