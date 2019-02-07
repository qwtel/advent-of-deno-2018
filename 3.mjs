#!/usr/bin/env node --experimental-modules

import { read, range, pluck, max, iproduct, pipe, map, find, filter, length, every, Array2D } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const PATTERN = /#(\d+)\ @\ (\d+),(\d+):\ (\d+)x(\d+)/;

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
    const dimX = maxX + maxW;
    const dimY = maxY + maxH;
    const field = new Array2D([[0, 0], [dimX, dimY]]);

    for (const { x, y, w, h } of claims) {
        const coords = iproduct(range(x, x + w), range(y, y + h));
        for (const p of coords) {
            field.set(p, 1 + field.get(p));
        }
    }

    const num = pipe(field, filter(x => x > 1), length());
    console.log(num);

    // part ii

    // console.time('for');
    // for (const { id, x, y, w, h } of claims) {
    //     const coords = iproduct(range(x, x + w), range(y, y + h));
    //     if (pipe(coords, every(p => field.get(p) === 1))) {
    //         console.log(id);
    //         break;
    //     }
    // }
    // console.timeEnd('for');

    // console.time('pipe');
    const res = pipe(
        claims,
        map(({ id, x, y, w, h }) => ({ id, coords: iproduct(range(x, x + w), range(y, y + h)) })),
        find(({ coords }) => pipe(coords, every(p => field.get(p) === 1)))
    );
    // console.timeEnd('pipe');
    console.log(res.id);
})();