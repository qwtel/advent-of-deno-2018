#!/usr/bin/env node --experimental-modules

import { read, pipe, some, sum, map, filter, frequencies, zip, combinations, find } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const ids = input.trim().split('\n');

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

    const twos = pipe(
        ids,
        map(id => frequencies(id)),
        map(fqs => pipe(fqs.values(), some(x => x === 2))),
        map(x => x ? 1 : 0),
        sum(0),
    );

    const threes = pipe(
        ids,
        map(id => frequencies(id)),
        map(fqs => pipe(fqs.values(), some(x => x === 3))),
        map(x => x ? 1 : 0),
        sum(0),
    );

    const checksum = twos * threes;
    console.log(checksum);

    // 2:
    const maxlen = ids[0].length;

    // for (const [id1, id2] of combinations(ids, ids)) {
    //     const res = [...pipe(
    //         zip(id1, id2), 
    //         filter(([l1, l2]) => l1 === l2), 
    //         map(([l]) => l)
    //     )]; 
    //     if (res.length === maxlen - 1) {
    //         console.log(res.join(''))
    //         break;
    //     }
    // }

    const res = pipe(
        combinations(ids, ids),
        map(([id1, id2]) => pipe(
            zip(id1, id2), 
            filter(([l1, l2]) => l1 === l2),
            map(([l]) => l),
        )),
        map(ls => [...ls]),
        find(ls => ls.length === maxlen - 1)
    );

    console.log(res.join(''));

})();
