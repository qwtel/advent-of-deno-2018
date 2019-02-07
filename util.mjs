import { Array2D } from './array2d.mjs';

export { Array2D };

export function pipe(x, ...fs) {
    let res = x;
    for (const f of fs) {
        res = f(res);
    }
    return res;
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

export function reduce(f, init) {
    return function (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
        }
        return res;
    }
}

export function reductions(f, init) {
    return function* (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
            yield res;
        }
    }
}

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

export function filter(p) {
    return function* (xs) {
        for (const x of xs) {
            if (p(x)) yield x;
        }
    }
}

export function partition(p) {
    return function (xs) {
        const [xs1, xs2] = tee(xs);
        return [
            filter(p)(xs1),
            filter(x => !p(x))(xs2),
        ];
    }
}

export function frequencies(iterable) {
    const fs = new Map();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}

export function* concat(...xss) {
    for (xs of xss)
        for (const x of xs) yield x;
}

export function concatWith(ys) {
    return function (xs) {
        return concat(xs, ys);
    }
}

export function* zip(...xss) {
    const iterables = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const results = iterables.map(xs => xs.next());
        if (results.some(r => r.done)) break;
        yield results.map(r => r.value);
    }
}

export function zipWith(ys) {
    return function (xs) {
        return zip(xs, ys);
    }
}

export function* zipOuter(...xss) {
    const iterables = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const results = iterables.map(xs => xs.next());
        if (results.every(r => r.done)) break;
        yield results.map(r => r.value);
    }
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
        const [xs1, _xs] = tee(xs);
        const [xs2, xs3] = tee(_xs);
        return [
            pluck(0)(xs1),
            pluck(1)(xs2),
            pluck(2)(xs3),
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

/*
export function* count() {
    let i = 0;
    while (true) {
        yield i++;
    }
}

export function* enumerate(xs) {
    let i = 0;
    for (const x of xs) {
        yield [i++, x];
    }
}
*/

// export function* partition(xs, n) {
//     const [xs1, xs2] = tee(xs);
//     return [take(xs1, n), skip(xs2, n)];
// }

// https://stackoverflow.com/a/46416353/870615
export function tee(iterable) {
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

export function pluck(key) {
    return function* (xs) {
        for (const x of xs) {
            yield x[key];
        }
    }
}

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    for (let i = start; i < end; i += step) yield i;
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

export function arrayCompare(as, bs) {
    const res = as[0] - bs[0];
    if (res === 0 && as.length > 1) {
        return arrayCompare(as.slice(1), bs.slice(1));
    } else {
        return res;
    }
}

export function* entries(obj) {
    for (const key in obj) {
        yield [key, obj[key]];
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

export function* enumerate(xs) {
    let i = 0;
    for (const x of xs) {
        yield [i++, x];
    }
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

// function deleteAll(A, B) {
//     for (const b of B) A.delete(b);
//     return A;
// }

export function subtract(A, B) {
    const C = new Set(A);
    for (const b of B) C.delete(b);
    return C;
}

export function union(A, B) {
    return new Set(concat(A, B));
}

export function pad(p, char = '0') {
    return n => (new Array(p).fill(char).join('') + n).slice(-p);
}

export function findAndRemove(arr, f) {
    const i = arr.findIndex(f);
    return i === -1
        ? null
        : arr.splice(i, 1)[0];
}

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

// function makeOutOfBounds([[minX, minY], [maxX, maxY]]) {
//     return ([x, y]) => x < minX || x >= maxX || y < minY || y >= maxY;
// }


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

export function sum(zero = 0, add = (a, b) => a + b) {
    return function (xs) {
        let res = zero;
        for (const x of xs) {
            res = add(res, x);
        }
        return res;
    }
}

// TODO: make "async utils"??

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

export async function read(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer.toString('utf8');
}

export function fillGaps(vs, gapValues = [undefined]) {
    return function* (xs) {
        for (const [x, v] of zip(xs, vs)) {
            if (!gapValues.includes(x)) yield x;
            else yield v;
        }
    }
}

export function* constantly(value) {
    while (true) yield value;
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

export function args(flags, defaults) {
    return pipe(
        flags,
        map(flag => process.argv.findIndex(arg => arg === flag)),
        map(i => process.argv[i + 1]),
        map(Number),
        fillGaps(defaults, [NaN]),
    );
}
