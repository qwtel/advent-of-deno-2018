const fs = require('fs').promises;

const { range, pluck, tee, pipe, filter, length, every, Array2D } = require('./util.js');

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
    const field = new Array2D(dimX, dimY);

    for (const { x, y, w, h } of claims) {
        const coords = combinations(range(x, x + w), range(y, y + h));
        for (const p of coords) {
            field.set(p, 1 + field.get(p));
        }
    }

    const num = pipe(field, filter(x => x > 1), length());
    console.log(num);

    // part ii

    for (const { id, x, y, w, h } of claims) {
        const coords = combinations(range(x, x + w), range(y, y + h));
        if (pipe(coords, every(p => field.get(p) === 1))) {
            console.log(id);
            break;
        }
    }
})();





