import { pipe, tee, teeN } from './common.mjs';

export { pipe };

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

export const inspect = tap;

export function forEach(f) {
    return function (xs) {
        for (const x of xs) {
            f(x);
        }
    }
}

export const subscribe = forEach;

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

export const reducutions = scan;

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

export function minBy(cf = (a, b) => a - b) {
    return function (xs) {
        const it = xs[Symbol.iterator]();
        const { done, value } = it.next();
        if (done) return Number.POSITIVE_INFINITY;
        let res = value;
        for (const x of it) if (cf(x, res) < 0) res = x;
        return res;
    };
}

export function maxBy(cf = (a, b) => a - b) {
    return function (xs) {
        const it = xs[Symbol.iterator]();
        const { done, value } = it.next();
        if (done) return Number.NEGATIVE_INFINITY;
        let res = value;
        for (const x of it) if (cf(x, res) > 0) res = x;
        return res;
    };
}

export function minMaxBy(cf = (a, b) => a - b) {
    return function (xs) {
        const it = xs[Symbol.iterator]();
        const { done, value } = it.next();
        if (done) return [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        let min = value;
        let max = value;
        for (const x of it) {
            if (cf(x, min) < 0) min = x;
            if (cf(x, max) > 0) max = x;
        }
        return [min, max];
    };
}

export function minByScan(cf = (a, b) => a - b) {
    return function* (xs) {
        const it = xs[Symbol.iterator]();
        const { done, value } = it.next();
        if (done) yield Number.POSITIVE_INFINITY;
        let res = value;
        for (const x of it) if (cf(x, res) < 0) {
            res = x;
            yield res;
        }
    };
}

export function maxByScan(cf = (a, b) => a - b) {
    return function* (xs) {
        const it = xs[Symbol.iterator]();
        const { done, value } = it.next();
        if (done) yield Number.NEGATIVE_INFINITY;
        let res = value;
        for (const x of it) if (cf(x, res) > 0) {
            res = x;
            yield res;
        }
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

export function grouped(n, step = n) {
    return function* (xs) {
        let group = [];
        for (const x of xs) {
            group.push(x);
            if (group.length === n) {
                yield [...group];
                for (let i = 0; i < step; i++) group.shift();
            }
        }
        // yield group; // ??
    }
}

export function startWith(...as) {
    return function* (xs) {
        for (const a of as) yield a;
        for (const x of xs) yield x;
    }
}

export function endWith(...zs) {
    return function* (xs) {
        for (const x of xs) yield x;
        for (const z of zs) yield z;
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


// CONSTRUCTORS

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    for (let i = start; end > start ? i < end : i > end; i += step) yield i;
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