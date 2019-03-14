#!/usr/bin/env deno

import { pipe, pluck, max, range } from './deps.ts';
import { read, args, subtract, Array2D } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    // Usage: ./6.mjs -m 32
    const [MAX] = args(['-m'], [10000]);

    type Point = [number, number];

    const bodies = input
        .trim()
        .split('\n')
        .map(s => s.split(', ').map(Number) as Point);

    const maxX = 1 + pipe(bodies, pluck<number>(0), max());
    const maxY = 1 + pipe(bodies, pluck<number>(1), max());

    type Cell = { index: number, dist?: number };
    const field = new Array2D<Cell>([[0, 0], [maxX, maxY]]);

    // yield all coordinates of manhatten distance `d` around point `(x, y)`
    function* manhatten(d: number, [x, y] = [0, 0]): IterableIterator<Point> {
        if (d !== 0) yield [x - d, y + 0];
        for (let i = -d + 1; i < d; i++) {
            const r = d - Math.abs(i);
            yield [x + i, y + r];
            yield [x + i, y - r];
        }
        yield [x + d, y + 0];
    }

    const size = maxX * maxY;
    let counter = 0;

    for (const dist of range()) {
        // break if no more empty cells within the field
        if (counter === size) break;


        for (const [index, body] of bodies.entries()) {
            // get all points of manhatten distance `dist` from `point`
            for (const p of manhatten(dist, body)) {
                if (field.isOutside(p)) continue;

                const cell = field.get(p);
                if (!cell) {
                    field.set(p, { index, dist });
                    counter++;
                } else if (cell.dist === dist) {
                    cell.index = -1;
                }
            }
        }
    }
    // console.timeEnd('solve');

    const field2 = field.map(({ index }) => index);

    // we're not interested in letters that touch the edge of the field
    const letters = new Set(field2);
    const excluded = new Set(field2.edgeValues());
    const included = subtract(letters, excluded);

    const counts = new Map();
    for (const letter of field2) {
        if (included.has(letter)) {
            counts.set(letter, 1 + (counts.get(letter) || 0));
        }
    }
    const res = pipe(counts.values(), max());

    // if (process.env.DEBUG) {
    //     const fieldRepr = field.map(({ index: i, dist }) => {
    //         if (dist === 0) return String.fromCharCode(i + 65);
    //         return i >= 0 ? String.fromCharCode(i + 65 + 32) : '.';
    //     });

    //     for (const row of fieldRepr.columns()) {
    //       console.log(row.join(''))
    //     }
    // }

    console.log(res);

    // 2
    const manhattenDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);

    const region = [];
    for (const coord of field2.coords()) {
        let total = 0;
        for (const body of bodies) {
            total += manhattenDist(coord, body)
            if (total >= MAX) break;
        }
        if (total < MAX) region.push(coord);
    }

    // if (process.env.DEBUG) {
    //     const fieldRepr = field.map(({ index: i, dist }) => {
    //         if (dist === 0) return String.fromCharCode(i + 65);
    //         return '.'
    //     });

    //     for (const p of region) {
    //         if (fieldRepr.get(p) === '.') fieldRepr.set(p, '#');
    //     }

    //     console.log(fieldRepr.toString());
    // }

    console.log(region.length);

})();
