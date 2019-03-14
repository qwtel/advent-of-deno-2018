#!/usr/bin/env deno

import { pipe, reduce, cycle, scan, find } from './deps.ts'
import { read, add } from './util/index.ts';

(async () => {
    const input = (await read(Deno.stdin))
        .trim()
        .split('\n')
        .map(Number);

    // 1
    console.log(pipe(input, reduce(add, 0)));

    class SetX<X> extends Set<X> { reduced?: X }

    // 2
    const res = pipe(
        cycle(input),
        scan(add, 0),
        scan((seen, freq) =>
            seen.has(freq)
                ? (seen.reduced = freq, seen)
                : seen.add(freq),
            new SetX()
        ),
        find(x => !!x.reduced),
    );

    console.log(res.reduced);
})();
