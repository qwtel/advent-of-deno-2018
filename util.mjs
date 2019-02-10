import { Array2D } from './array2d.mjs';

export { Array2D };

export function pipe(x, ...fs) {
    let res = x;
    for (const f of fs) {
        res = f(res);
    }
    return res;
}

// OPERATORS

export function map(f) {
    return function* (xs) {
        for (const x of xs) yield f(x);
    }
}

export function tap(f) {
    return function* (xs) {
        for (const x of xs) {
            f(x);
            yield x;
        }
    }
}

export function reduce(f, init) {
    return function (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
        }
        return res;
    }
}

export function scan(f, init) {
    return function* (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
            yield res;
        }
    }
}

export function some(p) {
    return function (xs) {
        for (const x of xs) {
            if (p(x)) return true;
        }
        return false;
    }
}

export function every(p) {
    return function (xs) {
        for (const x of xs) {
            if (!p(x)) return false;
        }
        return true;
    }
}

export function filter(p) {
    return function* (xs) {
        for (const x of xs) {
            if (p(x)) yield x;
        }
    }
}

// TODO: rename?
export function partition(p) {
    return function (xs) {
        const [xs1, xs2] = tee(xs);
        return [
            filter(p)(xs1),
            filter(x => !p(x))(xs2),
        ];
    }
}

export function skip(n) {
    return function* (xs) {
        let i = 0;
        for (let x of xs) {
            if (++i <= n) continue;
            yield x;
        }
    }
}

export function take(n) {
    return function* (xs) {
        let i = 0;
        for (let x of xs) {
            if (++i > n) break;
            yield x;
        }
    }
}

// TODO: rename?
export function splitAt(n) {
    return function (xs) {
        const [xs1, xs2] = tee(xs);
        return [
            take(n)(xs1),
            skip(n)(xs2),
        ];
    };
}

export function find(p) {
    return function (xs) {
        for (const x of xs) {
            if (p(x)) return x;
        }
        return null;
    }
}

export function findIndex(p) {
    return function (xs) {
        let i = 0;
        for (const x of xs) {
            if (p(x)) return i;
            i++;
        }
        return -1;
    }
}

export function concatWith1(ys) {
    return function (xs) {
        return concat(xs, ys);
    }
}

export function concatWith(...yss) {
    return function (xs) {
        return concat(xs, ...yss);
    };
}

export function zipWith1(ys) {
    return function* (xs) {
        const it = ys[Symbol.iterator]();
        for (const x of xs) {
            yield [x, it.next().value];
        }
    };
}

export function zipWith(...yss) {
    return function* (xs) {
        const its = yss.map(ys => ys[Symbol.iterator]());
        for (const x of xs) {
            yield [x, ...its.map(it => it.next().value)];
        }
    };
}

export function unzip2() {
    return function (xs) {
        const [xs1, xs2] = tee(xs);
        return [
            pluck(0)(xs1),
            pluck(1)(xs2),
        ];
    }
}

export function unzip(n = 2) {
    return function (xs) {
        const xss = teeN(xs, n);
        return xss.map((xs, i) => pluck(i)(xs));
    }
}

export function pluck(key) {
    return function* (xs) {
        for (const x of xs) {
            yield x[key];
        }
    }
}

// like pluck, but accepts an iterable of keys
export function select(keys) {
    return function* (xs) {
        for (const x of xs) {
            let r = x;
            for (const k of keys) {
                r = r != null ? r[k] : undefined;
            }
            yield r
        }
    }
}

export function groupBy(f) {
    return function (xs) {
        const res = new Map();
        for (const x of xs) {
            const key = f(x);
            if (!res.has(key)) res.set(key, []);
            res.get(key).push(x);
        }
        return res;
    }
}

export function groupByKey(key) {
    return groupBy(x => x[key]);
}

// export function groupByPath(keys) {
//     return groupBy(x => getIn(keys)(x));
// }

export function mapKeys(f) {
    return function* (xs) {
        for (const [k, v] of xs) yield [f(k), v];
    }
}

export function mapValues(f) {
    return function* (xs) {
        for (const [k, v] of xs) yield [k, f(v)];
    }
}

export function pairwise() {
    return function* (xs) {
        const it = xs[Symbol.iterator]();
        let prev = it.next().value;
        for (const x of it) {
            yield [prev, x];
            prev = x;
        }
    }
}

export function length() {
    return function (xs) {
        let c = 0;
        for (const _ of xs) c++;
        return c;
    }
}

export function min() {
    return function (xs) {
        let res = Number.POSITIVE_INFINITY;
        for (const x of xs) {
            if (x < res) res = x;
        }
        return res;
    }
}

export function max() {
    return function (xs) {
        let res = Number.NEGATIVE_INFINITY;
        for (const x of xs) {
            if (x > res) res = x;
        }
        return res;
    }
}

export function minMax() {
    return function (xs) {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const x of xs) {
            if (x < min) min = x;
            if (x > max) max = x;
        }
        return [min, max];
    }
}

// TODO: faster implementation
export function minBy(cf = (a, b) => a - b) {
    return xs => [...xs].sort(cf)[0];
}

// TODO: faster implementation
export function maxBy(cf = (a, b) => a - b) {
    return xs => [...xs].sort(cf).pop();
}

// TODO: faster implementation
export function minMaxBy(cf = (a, b) => a - b) {
    return xs => {
        const sorted = [...xs].sort(cf);
        return [sorted[0], sorted.pop()];
    };
}

export function sum(zero = 0) {
    return function (xs) {
        let res = zero;
        for (const x of xs) res += x;
        return res;
    }
}

export function replaceWhen(pf, ys) {
    return function* (xs) {
        for (const [x, y] of zip(xs, ys)) {
            if (!pf(x)) yield x;
            else yield y;
        }
    }
}

export function grouped(n) {
    return function* (xs) {
        let group = [];
        for (const x of xs) {
            group.push(x);
            if (group.length === n) {
                yield group;
                group = [];
            }
        }
    }
}

export function interleaveWith1(ys) {
    return function (xs) {
        return interleave2(xs, ys);
    }
}

export function interleaveWith(...yss) {
    return function (xs) {
        return interleave(xs, ...yss);
    }
}

export function sort(cf) {
    return function* (xs) {
        for (const x of [...xs].sort(cf)) yield x;
    }
}


// NOT OPERATORS

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    for (let i = start; i < end; i += step) yield i;
}

// TODO: rename to `entries`?
export function* enumerate(xs) {
    let i = 0;
    for (const x of xs) {
        yield [i++, x];
    }
}

export function* concat(...xss) {
    for (xs of xss)
        for (const x of xs) yield x;
}

export function* zip(...xss) {
    const its = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const rs = its.map(it => it.next());
        if (rs.some(r => r.done)) break;
        yield rs.map(r => r.value);
    }
}

// TODO: rename? Is this how regular zip commonly works?
export function* zipOuter(...xss) {
    const its = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const rs = its.map(it => it.next());
        if (rs.every(r => r.done)) break;
        yield rs.map(r => r.value);
    }
}

// TODO: generalize to n parameters
export function* product(as, bs) {
    let _bs = bs, bs2;
    for (const a of as) {
        [_bs, bs2] = tee(_bs);
        for (const b of bs2) {
            yield [a, b];
        }
    }
}

// TODO: generalize to n parameters
// TODO: other name (look at python itertools?)
export function* combinations(as, bs) {
    let _bs = bs, bs2;
    let i = 1;
    for (const a of as) {
        [_bs, bs2] = tee(_bs);
        for (const b of skip(i++)(bs2)) {
            yield [a, b];
        }
    }
}

export function* constantly(value) {
    while (true) yield value;
}

export function* cycle(xs) {
    let _xs = xs, xs2;
    while (true) {
        [_xs, xs2] = tee(_xs);
        for (const x of xs2) yield x;
    }
}

export function* repeat(xs, n) {
    let _xs = xs, xs2;
    for (let i = 0; i < n; i++) {
        [_xs, xs2] = tee(_xs);
        for (const x of xs2) yield x;
    }
}

export function* interleave2(xs, ys) {
    const itx = xs[Symbol.iterator]();
    const ity = ys[Symbol.iterator]();
    while (true) {
        const rx = itx.next();
        if (rx.done) break;
        else yield rx.value;
        const ry = ity.next();
        if (ry.done) break;
        else yield ry.value;
    }
}

export function* interleave(...xss) {
    const its = xss.map(xs => xs[Symbol.iterator]());
    outerloop: while (true) { // Throwback to the 90s
        for (const it of its) {
            const { done, value } = it.next();
            if (done) break outerloop; // Yup, this just happened
            else yield value;
        }
    }
}


// HELPERS

function isIterator(xs) {
    // By convention, an iterator returns itself when calling `Symbol.iterator`.
    return xs[Symbol.iterator]() === xs;
}

// https://stackoverflow.com/a/46416353/870615
function tee(it) {
    // If `it` is not an iterator, i.e. can be traversed more than once, 
    // we just return it unmodified.
    if (!isIterator(it)) return [it, it];

    const source = it[Symbol.iterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = i => {
        if (buffers[i].length) return buffers[i].shift();
        const x = source.next();
        if (x.done) return DONE;
        buffers[1 - i].push(x.value);
        return x.value;
    };

    return buffers.map(function* (_, i) {
        while (true) {
            const x = next(i);
            if (x === DONE) break;
            yield x;
        }
    });
}

// TODO: more performant impl?
function teeN(it, n = 2) {
    const res = [];
    let orig = it, copy;
    for (let i = 0; i < n - 1; i++) {
        [orig, copy] = tee(orig);
        res.push(copy);
    }
    res.push(orig);
    return res;
}


// OTHER STUFF

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

// SET OPERATIONS

export function union(...as) {
    return new Set(concat(...as));
}

export function subtract(as, ...bss) {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => !B.has(a)))(as));
}

export function intersect(as, ...bss) {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => B.has(a)))(as));
}


// VERY SPECIFIC

export async function read(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer.toString('utf8');
}

export function args(flags, defaults) {
    return pipe(
        flags,
        map(flag => process.argv.findIndex(arg => arg === flag)),
        map(i => process.argv[i + 1]),
        map(Number),
        replaceWhen(Number.isNaN, defaults),
    );
}

// TODO: make "async utils"

// export function asyncReduce(f, init) {
//     return async function (xs) {
//         let res = init;
//         for await (const x of xs) {
//             res = f(res, x);
//         }
//         return res;
//     }
// }

// export function asyncTap(f) {
//     return async function* (xs) {
//         for await (const x of xs) {
//             f(x);
//             yield x;
//         }
//     }
// }