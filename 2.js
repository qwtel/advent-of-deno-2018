const fs = require('fs').promises;

const { pipe, some, reduce, map, frequencies, zip, skip } = require('./util.js');

// NOTE: this wouldn't work with if `bs` is an iterator b/c it's called multiple times...
function* combinations(as, bs) {
    let i = 0;
    for (const a of as) {
        i++;
        for (const b of skip(i)(bs)) {
            yield [a, b];
        }
    }
}

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
