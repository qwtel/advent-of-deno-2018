const fs = require('fs').promises;

const { pipe, pluck, map2D, transpose } = require('./util.js');

(async () => {
    let input = `
position=< 9,  1> velocity=< 0,  2>
position=< 7,  0> velocity=<-1,  0>
position=< 3, -2> velocity=<-1,  1>
position=< 6, 10> velocity=<-2, -1>
position=< 2, -4> velocity=< 2,  2>
position=<-6, 10> velocity=< 2, -2>
position=< 1,  8> velocity=< 1, -1>
position=< 1,  7> velocity=< 1,  0>
position=<-3, 11> velocity=< 1, -2>
position=< 7,  6> velocity=<-1, -1>
position=<-2,  3> velocity=< 1,  0>
position=<-4,  3> velocity=< 2,  0>
position=<10, -3> velocity=<-1,  1>
position=< 5, 11> velocity=< 1, -2>
position=< 4,  7> velocity=< 0, -1>
position=< 8, -2> velocity=< 0,  1>
position=<15,  0> velocity=<-2,  0>
position=< 1,  6> velocity=< 1,  0>
position=< 8,  9> velocity=< 0, -1>
position=< 3,  3> velocity=<-1,  1>
position=< 0,  5> velocity=< 0, -1>
position=<-2,  2> velocity=< 2,  0>
position=< 5, -2> velocity=< 1,  2>
position=< 1,  4> velocity=< 2,  1>
position=<-2,  7> velocity=< 2, -2>
position=< 3,  6> velocity=<-1, -1>
position=< 5,  0> velocity=< 1,  0>
position=<-6,  0> velocity=< 2,  0>
position=< 5,  9> velocity=< 1, -2>
position=<14,  7> velocity=<-2,  0>
position=<-3,  6> velocity=< 2, -1>
`;

    input = await fs.readFile('10.txt', 'utf8');

    const RE = /position=<(.*), (.*)> velocity=<(.*), (.*)>/;

    const data = input.trim().split('\n')
        .map(line => RE.exec(line).slice(1).map(Number))
        .map(([a, b, c, d]) => ({
            position: [a, b],
            velocity: [c, d],
        }));

    const position = data.map(x => x.position);
    const minX = Math.min(...pipe(position, pluck(0)));
    const minY = Math.min(...pipe(position, pluck(1)));

    let data2 = data.map(({ position: [x, y], velocity }) => ({
        position: [x - minX, y - minY],
        velocity,
    }));

    const timeout = t => new Promise(r => setTimeout(r, t));

    let hitTarget = false;
    for (let i = 0; ; i++) {
        data2 = data2.map(({ position: [x, y], velocity: [dx, dy] }) => ({
            position: [x + dx, y + dy],
            velocity: [dx, dy],
        }));

        const position2 = data2.map(x => x.position);
        const minX = Math.min(...pipe(position2, pluck(0)));
        const minY = Math.min(...pipe(position2, pluck(1)));
        const maxX = Math.max(...pipe(position2, pluck(0)));
        const maxY = Math.max(...pipe(position2, pluck(1)));

        const diffX = maxX - minX;
        const diffY = maxY - minY;
        if (diffX < 125 && diffY < 38) {
            hitTarget = true;

            const field = new Array(diffX + 2).fill(0).map(() => new Array(diffY + 2).fill(0));
            for (const { position: [x, y] } of data2) {
                field[x - minX][y - minY] = true;
            }

            const fieldRepr = map2D(field, x => x ? '#' : '.');
            for (const row of transpose(fieldRepr)) {
                console.log(row.join(''))
            }
            console.log(i + 1);
            console.log('');

            await timeout(500);
        } else if (hitTarget) break;
    }
})();
