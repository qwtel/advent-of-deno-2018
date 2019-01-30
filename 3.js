const fs = require('fs').promises;

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

    const maxX = Math.max(...pluck(claims, 'x'));
    const maxY = Math.max(...pluck(claims, 'y'));
    const maxW = Math.max(...pluck(claims, 'w'));
    const maxH = Math.max(...pluck(claims, 'h'));
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
        if (every(coords, ([x, y]) => res[x][y] === 1)) {
            console.log(id);
            break;
        }
    }
})();

function* pluck(xs, key) {
    for (const x of xs) {
        yield x[key];
    }
}

function* range(start = 0, end = Number.POSITIVE_INFINITY, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

function* combinations(as, bs) {
    let bs1 = bs, bs2;
    for (const a of as) {
        // NOTE: need to work around the fact that iterators are only consumable once
        [bs1, bs2] = tee(bs1);
        for (const b of bs2) {
            yield [a, b];
        }
    }
}

function every(xs, p) {
    let res = true;
    for (const x of xs) {
        res = res && p(x);
    }
    return res;
}


// https://stackoverflow.com/a/46416353/870615
function tee(iterable) {
    const source = iterable[Symbol.iterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = i => {
        if (buffers[i].length !== 0) return buffers[i].shift();
        const x = source.next();
        if (x.done) return DONE;
        buffers[1 - i].push(x.value);
        return x.value;
    };

    return buffers.map(function* (_, i) {
        while (true) {
            const x = next(i);
            if (x === DONE) break;
            yield x;
        }
    });
}
