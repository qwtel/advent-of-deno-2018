#!/usr/bin/env node --experimental-modules

import { read, args, pipe, pluck, max, range, subtract, Array2D } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    // Usage: ./6.mjs -m 32
    const [MAX] = args(['-m'], [10000]);

    const points = input.trim().split('\n').map(s => s.split(', ').map(Number));
    // console.log(points);

    // console.time('solve');
    const maxX = 1 + pipe(points, pluck(0), max());
    const maxY = 1 + pipe(points, pluck(1), max());
    const field = new Array2D([[0, 0], [maxX, maxY]]);

    // yield all coordinates of manhatten distance `d` around point `(x, y)`
    function* manhatten(d, [x, y] = [0, 0]) {
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

        for (const [index, point] of points.entries()) {
            // get all points of manhatten distance `dist` from `point`
            for (const p of manhatten(dist, point)) {
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
    console.log(res);

    // 2
    const manhattenDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);

    const region = [];
    for (const [x, y] of field2.coords()) {
        let total = 0;
        for (const point of points) {
            total += manhattenDist([x, y], point)
            if (total >= MAX) break;
        }
        // console.log(total);
        if (total < MAX) region.push([x, y]);
    }
    console.log(region.length);

    // const fieldRepr = map2D(field, ({ index: i, dist }) => {
    //   if (dist === 0) return String.fromCharCode(i + 65);
    // //   return i >= 0 ? String.fromCharCode(i + 65 + 32) : '.';
    //     return '.'
    // });

    // for (const [x, y] of region) {
    //     if (fieldRepr[x][y] === '.') fieldRepr[x][y] = '#';
    // }

    // for (const row of transpose(fieldRepr)) {
    //   console.log(row.join(''))
    // }
})();
