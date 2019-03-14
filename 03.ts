#!/usr/bin/env deno

import { range, pluck, max, product2, pipe, filter, length, every } from './deps.ts';
import { read, Array2D } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    const PATTERN = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

    const claims = input
        .trim()
        .split('\n')
        .map(id => PATTERN.exec(id))
        .map(ex => ex.slice(1).map(Number))
        .map(([id, x, y, w, h]) => ({ id, x, y, w, h }));

    const maxX = pipe(claims, pluck<number>('x'), max());
    const maxY = pipe(claims, pluck<number>('y'), max());
    const maxW = pipe(claims, pluck<number>('w'), max());
    const maxH = pipe(claims, pluck<number>('h'), max());
    const field = new Array2D<number>([[0, 0], [maxX + maxW, maxY + maxH]]);

    for (const { x, y, w, h } of claims) {
        const coords = product2(range(x, x + w), range(y, y + h));
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
            const coords = product2(range(x, x + w), range(y, y + h));
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
