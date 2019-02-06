function pipe(coll, ...fs) {
    let res = coll;
    for (const f of fs) {
        res = f(res);
    }
    return res;
}

function some(p) {
    return function (xs) {
        for (const x of xs) {
            if (p(x)) return true;
        }
        return false;
    }
}

function every(p) {
    return function (xs) {
        for (const x of xs) {
            if (!p(x)) return false;
        }
        return true;
    }
}

function reduce(f, init) {
    return function (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
        }
        return res;
    }
}

function map(f) {
    return function* (xs) {
        for (const x of xs) yield f(x);
    }
}

function tap(f) {
    return function* (xs) {
        for (const x of xs) {
            f(x);
            yield x;
        }
    }
}

function filter(p) {
    return function* (xs) {
        for (const x of xs) {
            if (p(x)) yield x;
        }
    }
}

function partition(p) {
    return function (xs) {
        return [
            filter(p)(xs),
            filter(x => !p(x))(xs),
        ];
    }
}

function frequencies(iterable) {
    const fs = new Map();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}

function* concat(...xss) {
    for (xs of xss)
        for (const x of xs) yield x;
}

function* zip(...xss) {
    const iterables = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const results = iterables.map(xs => xs.next());
        if (results.some(r => r.done)) break;
        yield results.map(r => r.value);
    }
}

function* zipOuter(...xss) {
    const iterables = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const results = iterables.map(xs => xs.next());
        if (results.every(r => r.done)) break;
        yield results.map(r => r.value);
    }
}

// function* unzip(xs) {
//     for (const [a, b] of xs) {
//     }
//     return [{
//         next() {

//         }
//     }, {

//     }]
// }

function skip(n) {
    return function* (xs) {
        let i = 0;
        for (let x of xs) {
            i++;
            if (i <= n) continue;
            yield x;
        }
    }
}

function take(n) {
    return function* (xs) {
        let i = 0;
        for (let x of xs) {
            i++;
            if (i > n) break;
            yield x;
        }
    }
}

/*
function* count() {
    let i = 0;
    while (true) {
        yield i++;
    }
}

function* enumerate(xs) {
    let i = 0;
    for (const x of xs) {
        yield [i++, x];
    }
}
*/

// function* partition(xs, n) {
//     const [xs1, xs2] = tee(xs);
//     return [take(xs1, n), skip(xs2, n)];
// }

// https://stackoverflow.com/a/46416353/870615
function tee(iterable) {
    const source = iterable[Symbol.iterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = i => {
        if (buffers[i].length !== 0) return buffers[i].shift();
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

function pluck(key) {
    return function* (xs) {
        for (const x of xs) {
            yield x[key];
        }
    }
}

function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

function groupBy(f) {
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

function mapValues(f) {
    return function* (xs) {
        for (const [k, v] of xs) yield [k, f(v)];
    }
}

function find(p) {
    return function (xs) {
        for (const x of xs) {
            if (p(x)) return x;
        }
        return null;
    }
}


function findIndex(p) {
    return function (xs) {
        let i = 0;
        for (const x of xs) {
            if (p(x)) return i;
            i++;
        }
        return -1;
    }
}

function arrayCompare(as, bs) {
    const res = as[0] - bs[0];
    if (res === 0 && as.length > 1) {
        return arrayCompare(as.slice(1), bs.slice(1));
    } else {
        return res;
    }
}

function* entries(obj) {
    for (const key in obj) {
        yield [key, obj[key]];
    }
}

function* pairwise(xs) {
    let prev;
    for (const x of xs) {
        if (prev) yield [prev, x];
        prev = x;
    }
}

function* enumerate(xs) {
    let i = 0;
    for (const x of xs) {
        yield [i++, x];
    }
}

function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
}

function flatten(arr) {
    return arr.reduce((a, x) => a.concat(x), []);
}

function* walk2D(arr2D) {
    for (const row of arr2D)
        for (const cell of row)
            yield cell;
}

function map2D(arr2D, f) {
    return arr2D.map(row => row.map(f));
}

// function deleteAll(A, B) {
//     for (const b of B) A.delete(b);
//     return A;
// }

function subtract(A, B) {
    const C = new Set(A);
    for (const b of B) C.delete(b);
    return C;
}

function union(A, B) {
    return new Set(concat(A, B));
}

function pad(p, char = '0') {
    return n => (new Array(p).fill(char).join('') + n).slice(-p);
}

function findAndRemove(arr, f) {
    const i = arr.findIndex(f);
    return i === -1
        ? null
        : arr.splice(i, 1)[0];
}

function makeIncWrapped(maxX) {
    return x => (++x) % maxX;
}

function* cycle(xs) {
    const cache = [];
    for (const x of xs) {
        cache.push(x);
        yield x;
    }
    const inc = makeIncWrapped(cache.length);
    let i = 0;
    while (true) {
        yield cache[i];
        i = inc(i);
    }
}

// function makeOutOfBounds([[minX, minY], [maxX, maxY]]) {
//     return ([x, y]) => x < minX || x >= maxX || y < minY || y >= maxY;
// }


function length() {
    return function (xs) {
        let c = 0;
        for (const _ of xs) c++;
        return c;
    }
}

const { Array2D } = require('./array2d.js');

function min(absMax = Number.POSITIVE_INFINITY, cf = (a, b) => a - b) {
    return function (xs) {
        let min = absMax;
        for (const x of xs) {
            if (cf(x, min) < 0) min = x;
        }
        return min;
    }
}

function max(absMin = Number.NEGATIVE_INFINITY, cf = (a, b) => a - b) {
    return function (xs) {
        let max = absMin;
        for (const x of xs) {
            if (cf(x, max) > 0) max = x;
        }
        return max;
    }
}

function minMax([absMax, absMin] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], cf = (a, b) => a - b) {
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

function sum(zero = 0, add = (a, b) => a + b) {
    return function(xs) {
        let res = zero;
        for (const x of xs) {
            res = add(res, x);
        }
        return res;
    }
}

// function asyncReduce(f, init) {
//     return async function (xs) {
//         let res = init;
//         for await (const x of xs) {
//             res = f(res, x);
//         }
//         return res;
//     }
// }

// function asyncTap(f) {
//     return async function* (xs) {
//         for await (const x of xs) {
//             f(x);
//             yield x;
//         }
//     }
// }

async function streamToString(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer.toString('utf8');
}

function fillGaps(vs, gapValues = [undefined]) {
    return function*(xs) {
        for (const [x, v] of zip(xs, vs)) {
            if (!gapValues.includes(x)) yield x;
            else yield v;
        }
    }
}

module.exports = {
    pipe,
    some,
    every,
    reduce,
    map,
    tap,
    filter,
    partition,
    frequencies,
    concat,
    zip,
    zipOuter,
    skip,
    take,
    tee,
    pluck,
    range,
    groupBy,
    mapValues,
    find,
    findIndex,
    arrayCompare,
    entries,
    pairwise,
    enumerate,
    transpose,
    flatten,
    walk2D,
    map2D,
    // deleteAll,
    subtract,
    union,
    findAndRemove,
    makeIncWrapped,
    cycle,
    Array2D,
    length,
    min,
    max,
    minMax,
    sum,
    streamToString,
    fillGaps,
};