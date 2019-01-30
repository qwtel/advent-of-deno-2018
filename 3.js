const fs = require('fs').promises;

const { range, pluck, tee, pipe, every } = require('./util.js');

function* combinations(as, bs) {
    let bsb = bs, bsw;
    for (const a of as) {
        // NOTE: need to work around the fact that iterators are only consumable once
        [bsb, bsw] = tee(bsb);
        for (const b of bsw) {
            yield [a, b];
        }
    }
}

(async () => {
    let input = `
#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2`;
    input = await fs.readFile('3.txt', 'utf8');

    const PATTERN = /#(\d+)\ @\ (\d+),(\d+):\ (\d+)x(\d+)/;

    const claims = input
        .trim()
        .split('\n')
        .map(id => PATTERN.exec(id))
        .map(ex => ex.slice(1, 6).map(Number))
        .map(([id, x, y, w, h]) => ({ id, x, y, w, h }));

    const maxX = Math.max(...pipe(claims, pluck('x')));
    const maxY = Math.max(...pipe(claims, pluck('y')));
    const maxW = Math.max(...pipe(claims, pluck('w')));
    const maxH = Math.max(...pipe(claims, pluck('h')));
    const dimX = maxX + maxW;
    const dimY = maxY + maxH;
    const res = new Array(dimX).fill(0).map(() => new Array(dimY).fill(0));

    for (const { x, y, w, h } of claims) {
        for (const xi of range(x, x + w)) {
            for (const yi of range(y, y + h)) {
                res[xi][yi] += 1;
            }
        }
    }

    const num = Array.prototype.concat(...res)
        .filter(x => x > 1)
        .length

    console.log(num);

    // part ii

    for (const { id, x, y, w, h } of claims) {
        const coords = combinations(range(x, x + w), range(y, y + h));
        if (pipe(coords, every(([x, y]) => res[x][y] === 1))) {
            console.log(id);
            break;
        }
    }
})();





