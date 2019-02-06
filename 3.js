const fs = require('fs').promises;

const { streamToString, range, pluck, max, tee, pipe, filter, length, every, Array2D } = require('./util.js');

function* iproduct(as, bs) {
    let bs1 = bs, bs2;
    for (const a of as) {
        // NOTE: need to work around the fact that iterators are only consumable once
        [bs1, bs2] = tee(bs1);
        for (const b of bs2) {
            yield [a, b];
        }
    }
}

(async () => {
    const input = await streamToString(process.stdin);

    const PATTERN = /#(\d+)\ @\ (\d+),(\d+):\ (\d+)x(\d+)/;

    const claims = input
        .trim()
        .split('\n')
        .map(id => PATTERN.exec(id))
        .map(ex => ex.slice(1, 6).map(Number))
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

    for (const { id, x, y, w, h } of claims) {
        const coords = iproduct(range(x, x + w), range(y, y + h));
        if (pipe(coords, every(p => field.get(p) === 1))) {
            console.log(id);
            break;
        }
    }
})();





