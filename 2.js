const fs = require('fs').promises;

(async () => {
    const ids = (await fs.readFile('2.txt', 'utf8')).trim().split('\n');

    // const twos = [], threes = [];
    // for (const id of ids) {
    //     const freq = frequencies(id);

    //     for (const [l, v] of freq) {
    //         if (v === 2) {
    //             twos.push([id, l]);
    //             break;
    //         }
    //     }

    //     for (const [l, v] of freq) {
    //         if (v === 3) {
    //             threes.push([id, l]);
    //             break;
    //         }
    //     }
    // }
    // console.log(twos.length * threes.length);

    // const repeats = [...map(ids, containsRepeats)]; // HACK
    // const twos = length(filter(repeats, ({ two }) => two));
    // const threes = length(filter(repeats, ({ three }) => three));
    // const checksum = twos * threes;
    // console.log(checksum);

    // function containsRepeats(id) {
    //     const freq = frequencies(id);
    //     return [
    //         some(freq.values(), x => x === 2),
    //         some(freq.values(), x => x === 3),
    //     ]
    // }

    // const [twos, threes] = reduce(
    //     map(ids, containsRepeats), 
    //     ([twos, threes], [two, three]) => [
    //         twos + (two ? 1 : 0), 
    //         threes + (three ? 1 : 0),
    //     ], 
    //     [0, 0]
    // );

    // const checksum = twos * threes;
    // console.log(checksum);

    const bool2Num = x => x ? 1 : 0;
    const add = (a, b) => a + b;

    // Version without pipe:

    // const twos = map(id => some(x => x === 2)(frequencies(id).values()))(ids);
    // const threes = map(id => some(x => x === 3)(frequencies(id).values()))(ids);
    // const numTwos = reduce(add, 0)(map(bool2Num)(twos));
    // const numThrees = reduce(add, 0)(map(bool2Num)(threes));
    // const checksum = numTwos * numThrees;

    const twos = pipe(ids,
        map(id => frequencies(id)),
        map(freq => pipe(freq.values(), some(x => x === 2))),
        map(bool2Num),
        reduce(add, 0)
    );

    const threes = pipe(ids,
        map(id => frequencies(id)),
        map(freq => pipe(freq.values(), some(x => x === 3))),
        map(bool2Num),
        reduce(add, 0)
    );

    const checksum = twos * threes;
    console.log(checksum);

    // what's bad about this solution? 
    // frequencies calculated twice!

    // 2:
    const maxlen = ids[0].length;

    for (const [fst, snd] of combinations(ids, ids)) {
        const res = [];
        for (const [l1, l2] of zip(fst, snd)) {
            if (l1 === l2) res.push(l1);
        }
        if (res.length === maxlen - 1) console.log(res.join(''))
    }
})();

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

// function* unzip(xs) {
//     for (const [a, b] of xs) {
//     }
//     return [{
//         next() {

//         }
//     }, {

//     }]
// }

function frequencies(iterable) {
    const fs = new Map();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}


function* zip(...xss) {
    const iterables = xss.map(xs => xs[Symbol.iterator]());
    while (true) {
        const results = iterables.map(xs => xs.next());
        if (results.some(r => r.done)) break;
        yield results.map(r => r.value);
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

function* skip(xs, n) {
    let i = 0;
    for (let x of xs) {
        i++;
        if (i <= n) continue;
        yield x;
    }
}

function* take(xs, n) {
    let i = 0;
    for (let x of xs) {
        i++;
        if (i > n) break;
        yield x;
    }
}

// function* partition(xs, n) {
//     const [xs1, xs2] = tee(xs);
//     return [take(xs1, n), skip(xs2, n)];
// }

// NOTE: this wouldn't work with if `bs` is an iterator b/c it's called multiple times...
function* combinations(as, bs) {
    let i = 0;
    for (const a of as) {
        i++;
        for (const b of skip(bs, i)) {
            yield [a, b];
        }
    }
}