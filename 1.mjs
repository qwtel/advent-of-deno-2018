#!/usr/bin/env node --experimental-modules

import { streamToString, pipe, sum, cycle, reductions, find } from './util.mjs';

(async () => {
    const input = (await streamToString(process.stdin))
        .trim()
        .split('\n')
        .map(Number);

    console.log(pipe(input, sum(0)));

    const res = pipe(
        cycle(input),
        reductions(({ acc, seen }, x) => {
            acc += x;
            return seen.has(acc) 
                ? { reduced: acc }
                : { acc, seen: seen.add(acc) };
        }, { acc: 0, seen: new Set() }),
        find(({ reduced }) => reduced)
    );

    console.log(res.reduced);
})();