#!/usr/bin/env deno

import { pipe, some, sum, map, filter, reduce, find, zip2, combinations2, unzip2 } from './deps.ts';
import { read, frequencies } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    const ids = input.trim().split('\n');

    // 1
    const checksum = pipe(
        ids,
        map(id => frequencies(id)),
        map(fqs => [
            pipe(fqs.values(), some(x => x === 2)),
            pipe(fqs.values(), some(x => x === 3)),
        ] as [boolean, boolean]),
        unzip2(),
        map(xs => pipe(xs, map(x => x ? 1 : 0), sum())),
        reduce((a, b) => a * b, 1),
    );

    console.log(checksum);

    // 2
    const maxlen = ids[0].length;

    const id = pipe(
        combinations2(ids),
        map(([id1, id2]) => pipe(
            zip2(id1, id2),
            filter(([c1, c2]) => c1 === c2),
            map(([c]) => c),
        )),
        map(cs => [...cs].join('')),
        find(id => id.length === maxlen - 1),
    );

    console.log(id);

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
