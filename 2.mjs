#!/usr/bin/env node --experimental-modules

import { read, pipe, some, sum, map, filter, frequencies, zip, combinations, find, unzip2 } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const ids = input.trim().split('\n');

    const [twos, threes] = pipe(
        ids,
        map(id => frequencies(id)),
        map(fqs => [
            pipe(fqs.values(), some(x => x === 2)),
            pipe(fqs.values(), some(x => x === 3)),
        ]),
        unzip2(),
        map(xs => pipe(xs,
            map(x => x ? 1 : 0),
            sum(),
        )),
    );

    const checksum = twos * threes;
    console.log(checksum);

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

    // 2:
    const maxlen = ids[0].length;

    const id = pipe(
        combinations(ids, ids),
        map(([id1, id2]) => pipe(
            zip(id1, id2),
            filter(([c1, c2]) => c1 === c2),
            map(([c]) => c),
        )),
        map(cs => [...cs].join('')),
        find(id => id.length === maxlen - 1),
    );

    console.log(id);

    // for (const [id1, id2] of combinations(ids, ids)) {
    //     const res = [];
    //     for (const [c1, c2] of zip(id1, id2)) {
    //         if (c1 === c2) res.push(c1);
    //     }
    //     if (res.length === maxlen - 1) {
    //         console.log(res.join(''))
    //         break;
    //     }
    // }

})();
