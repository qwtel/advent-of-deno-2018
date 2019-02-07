#!/usr/bin/env node --experimental-modules

import { read, pipe, reduce, cycle, reductions, find } from './util.mjs';

(async () => {
    const input = (await read(process.stdin))
        .trim()
        .split('\n')
        .map(Number);

    const add = (a, b) => a + b;

    // 1
    console.log(pipe(input, reduce(add, 0)));

    // 2
    const res = pipe(
        cycle(input),
        reductions(add, 0),
        reductions(
            (seen, freq) => seen.has(freq)
                ? { reduced: freq }
                : seen.add(freq),
            new Set()
        ),
        find(({ reduced }) => reduced)
    );

    console.log(res.reduced);
})();