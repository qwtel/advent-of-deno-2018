#!/usr/bin/env deno

import { range, pipe, map, reduce, startWith, endWith, mapValues, sum, grouped, zip2 } from './deps.ts';
import { read } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    const [stateStr, , ...patternsStr] = input.trim().split('\n');

    const RE_INSTATE = /initial state: ([.#]*)/;
    const RE_PATTERN = /([.#]*) => ([.#])/;

    type Plant = '.' | '#';

    const [state] = RE_INSTATE.exec(stateStr).slice(1) as [string];
    const patterns = new Map(
        patternsStr.map(p => RE_PATTERN.exec(p).slice(1) as [string, Plant])
    );

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
                x => [...x].join('')
            )
        }, state),
    );

    const res = pipe(
        zip2(range(GEN * -1 * 2), finalState),
        mapValues(v => v === '#' ? 1 : 0),
        map(([k, v]) => k * v),
        sum(),
    );

    console.log(res)
})();
