#!/usr/bin/env node --experimental-modules

import { read, range, pluck, max, product, pipe, filter, length, every, Array2D } from './util';

(async () => {
    const input = await read(process.stdin);

    const PATTERN = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

    const claims = input
        .trim()
        .split('\n')
        .map(id => PATTERN.exec(id))
        .map(ex => ex.slice(1).map(Number))
        .map(([id, x, y, w, h]) => ({ id, x, y, w, h }));

    const maxX = pipe(claims, pluck('x'), max());
    const maxY = pipe(claims, pluck('y'), max());
    const maxW = pipe(claims, pluck('w'), max());
    const maxH = pipe(claims, pluck('h'), max());
    const field = new Array2D([[0, 0], [maxX + maxW, maxY + maxH]]);

    for (const { x, y, w, h } of claims) {
        const coords = product(range(x, x + w), range(y, y + h));
        for (const p of coords) {
            field.set(p, 1 + field.get(p));
        }
    }

    // 1
    const num = pipe(field, filter(x => x > 1), length());
    console.log(num);

    // 2
    function solve2() {
        for (const { id, x, y, w, h } of claims) {
            const coords = product(range(x, x + w), range(y, y + h));
            if (pipe(coords, every(p => field.get(p) === 1))) {
                return id;
            }
        }
    }
    console.log(solve2());

    // const res = pipe(
    //     claims,
    //     map(({ id, x, y, w, h }) => ({
    //         id,
    //         coords: product(range(x, x + w), range(y, y + h)),
    //     })),
    //     find(({ coords }) => pipe(coords, every(p => field.get(p) === 1)))
    // );
    // console.log(res.id);
})();
