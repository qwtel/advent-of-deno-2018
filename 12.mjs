#!/usr/bin/env node --experimental-modules

import { read, range, pipe, map, reduce, startWith, endWith, mapValues, sum, grouped, zip } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const [stateStr, , ...patternsStr] = input.trim().split('\n');

    const RE_INSTATE = /initial state: ([.#]*)/;
    const RE_PATTERN = /([.#]*) => ([.#])/;

    const [, state] = RE_INSTATE.exec(stateStr);
    const patterns = new Map(patternsStr.map(p => RE_PATTERN.exec(p).slice(1)));

    const GEN = 20;

    // Note: This solution doesn't work with an input of 50_000_000_000. 
    // Just running an empty loop to 50B takes ~ a minute in JS on my laptop...

    const finalState = pipe(
        range(0, GEN),
        reduce((state, gen) => {
            return pipe(
                state,
                startWith(...'....'),
                endWith(...'....'),
                grouped(5, 1),
                map(x => patterns.get(x.join('')) || '.'),
            );
        }, state),
    );

    const res = pipe(
        zip(range(GEN * -1 * 2), finalState),
        mapValues(v => v === '#' ? 1 : 0),
        map(([k, v]) => k * v),
        sum(),
    );

    console.log(res)
})();
