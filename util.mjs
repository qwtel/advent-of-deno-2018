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

// TODO: generalized unzip function that peeks the first element (or takes length arg)
export function unzip2() {
    return function (xs) {
        const [xs1, xs2] = tee(xs);
        return [
            pluck(0)(xs1),
            pluck(1)(xs2),
        ];
    }
}

export function unzip3() {
    return function (xs) {
        // TODO: generalized tee for arbitrary n
        const [xs1, _xs] = tee(xs);
        const [xs2, xs3] = tee(_xs);
        return [
            pluck(0)(xs1),
            pluck(1)(xs2),
            pluck(2)(xs3),
        ];
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

export function min(absMax = Number.POSITIVE_INFINITY, cf = (a, b) => a - b) {
    return function (xs) {
        let min = absMax;
        for (const x of xs) {
            if (cf(x, min) < 0) min = x;
        }
        return min;
    }
}

export function max(absMin = Number.NEGATIVE_INFINITY, cf = (a, b) => a - b) {
    return function (xs) {
        let max = absMin;
        for (const x of xs) {
            if (cf(x, max) > 0) max = x;
        }
        return max;
    }
}

export function minMax([absMax, absMin] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], cf = (a, b) => a - b) {
    return function (xs) {
        let min = absMax;
        let max = absMin;
        for (const x of xs) {
            if (cf(x, min) < 0) min = x;
            if (cf(x, max) > 0) max = x;
        }
        return [min, max];
    }
}

export function sum(zero = 0) {
    return function (xs) {
        let res = zero;
        for (const x of xs) res += x;
        return res;
    }
}

export function fillGaps(vs, gapValues = [undefined]) {
    return function* (xs) {
        for (const [x, v] of zip(xs, vs)) {
            if (!gapValues.includes(x)) yield x;
            else yield v;
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
        // TODO: only tee when bs is an iterator!?
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
        // TODO: only tee when bs is an iterator!?
        [_bs, bs2] = tee(_bs);
        for (const b of skip(i++)(bs2)) {
            yield [a, b];
        }
    }
}

export function* constantly(value) {
    while (true) yield value;
}

// TODO: version that doesn't cache when `xs` is an iterable
export function* cycle(xs) {
    const cache = [];
    for (const x of xs) {
        cache.push(x);
        yield x;
    }
    let i = 0;
    while (true) {
        yield cache[i];
        i = (i + 1) % cache.length;
    }
}

// TODO: Implementation that pulls values one at a time instead of usign zip
export function* interleave2(xs, ys) {
    for (const [x, y] of zip(xs, ys)) {
        yield x;
        yield y;
    }
}

// TODO: Implementation that pulls values one at a time instead of usign zip
export function* interleave(...xss) {
    for (const xs of zip(...xss))
        for (const x of xs)
            yield x;
}


// HELPERS

// By convention, an iterator returns `this` when calling `Symbol.iterator`
function isIterator(xs) {
    return xs[Symbol.iterator]() === xs;
}

// https://stackoverflow.com/a/46416353/870615
function tee(iterable) {
    const source = iterable[Symbol.iterator]();
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

export function flatten(arr) {
    return arr.reduce((a, x) => a.concat(x), []);
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

function getIn(keys) {
    return (x) => {
        let r = x;
        for (const k of keys) {
            r = r != null ? r[k] : undefined;
        }
        return r;
    }
}

// SET OPERATIONS

export function subtract(A, B) {
    const _B = B instanceof Set ? B : new Set(B);
    return new Set(filter(a => !_B.has(a))(A));
}

export function intersect(A, B) {
    const _B = B instanceof Set ? B : new Set(B);
    return new Set(filter(a => _B.has(a))(A));
}

export function union(A, B) {
    return new Set(concat(A, B));
}

// export function deleteAll(A, B) {
//     for (const b of B) A.delete(b);
//     return A;
// }


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
        fillGaps(defaults, [NaN]),
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