#!/usr/bin/env deno

import { range, constantly, zip2, unzip2, pipe, map, minMax, scan, pairwise, find, pluck } from './deps.ts';
import { read, Array2D } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);
    const lines = input.trim().split('\n');

    const RE = /position=<(.*), (.*)> velocity=<(.*), (.*)>/;

    type Point = [number, number];
    type Bounds = [Point, Point];

    const [positions, velocities] = pipe(
        lines,
        map(line => RE.exec(line).slice(1).map(Number)),
        map(([a, b, c, d]) => [[a, b], [c, d]] as [Point, Point]),
        unzip2(),
        map(it => [...it]),
    );

    const getBounds = (ps: Point[]): Bounds => {
        const [minX, maxX] = pipe(ps, pluck<number>(0), minMax());
        const [minY, maxY] = pipe(ps, pluck<number>(1), minMax());
        return [[minX, minY], [maxX + 1, maxY + 1]];
    };

    const calcSize = ([[minX, minY], [maxX, maxY]]: Bounds): number =>
        (maxX - minX) * (maxY - minY);

    const [[finalPositions], sec] = pipe(
        constantly(velocities),
        scan(
            (positions, velocities) => [...pipe(
                zip2(positions, velocities),
                map(([[x, y], [dx, dy]]) => [x + dx, y + dy] as Point),
            )],
            positions,
        ),
        pairwise(),
        _ => zip2(_, range(1)),
        // Looking for the constellation with the smallest overall size.
        // Using the fact that the size is steadly decreasing until it starts to increase.
        find<[[Point[], Point[]], number]>(([[prev, curr], sec]) => {
            const prevSize = calcSize(getBounds(prev));
            const currSize = calcSize(getBounds(curr));
            return currSize > prevSize;
        }),
    );

    const field = new Array2D<boolean>(getBounds(finalPositions));
    for (const p of finalPositions) field.set(p, true);

    const fieldRepr = field.map(x => x ? '#' : '.');
    console.log(fieldRepr.toString());

    // 2
    console.log(sec);

    // old solutions, not quite as nice
    //
    // const timeout = t => new Promise(r => setTimeout(r, t));
    //
    // let hitTarget = false;
    // let data2 = data;
    // for (const sec of range(1)) {
    //     // HACK: overwriting data...
    //     data2 = data2.map(({ position: [x, y], velocity: [dx, dy] }) => ({
    //         position: [x + dx, y + dy],
    //         velocity: [dx, dy],
    //     }));

    //     const [minX, maxX] = pipe(data, map(x => x.position[0]), minMax());
    //     const [minY, maxY] = pipe(data, map(x => x.position[1]), minMax());

    //     if ((maxX - minX) < 125 && (maxY - minY) < 38) {
    //         hitTarget = true;

    //         const field = new Array2D([[minX, minY], [maxX + 1, maxY + 1]]);

    //         for (const { position } of data) field.set(position, true);

    //         const fieldRepr = field.map(x => x ? '#' : '.');
    //         console.log(fieldRepr.toString());
    //         console.log(sec);
    //         console.log('');

    //         await timeout(500);
    //     } else if (hitTarget) break;
    // }
})();
