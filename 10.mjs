#!/usr/bin/env node --experimental-modules

import { read, range, pipe, map, minMax, Array2D } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const RE = /position=<(.*), (.*)> velocity=<(.*), (.*)>/;

    let data = input
        .trim()
        .split('\n')
        .map(line => RE.exec(line).slice(1).map(Number))
        .map(([a, b, c, d]) => ({
            position: [a, b],
            velocity: [c, d],
        }));

    const timeout = t => new Promise(r => setTimeout(r, t));

    let hitTarget = false;
    for (const sec of range(1)) {
        // HACK: overwriting data...
        data = data.map(({ position: [x, y], velocity: [dx, dy] }) => ({
            position: [x + dx, y + dy],
            velocity: [dx, dy],
        }));

        const [minX, maxX] = pipe(data, map(x => x.position[0]), minMax());
        const [minY, maxY] = pipe(data, map(x => x.position[1]), minMax());

        if ((maxX - minX) < 125 && (maxY - minY) < 38) {
            hitTarget = true;

            const field = new Array2D([[minX, minY], [maxX + 1, maxY + 1]]);

            for (const { position } of data) field.set(position, true);

            const fieldRepr = field.map(x => x ? '#' : '.');
            for (const row of fieldRepr.transpose().rows()) {
                console.log(row.join(''))
            }
            console.log(sec);
            console.log('');

            await timeout(500);
        } else if (hitTarget) break;
    }
})();
