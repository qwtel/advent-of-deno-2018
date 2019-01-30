const fs = require('fs').promises;

(async () => {
    let input = `
1, 1
1, 6
8, 3
3, 4
5, 5
8, 9
`;
    input = (await fs.readFile('6.txt', 'utf8')).trim();
    const MAX = 10000;

    const coords = input.trim().split('\n').map(s => s.split(', ').map(Number));
    // console.log(coords);

    console.time('solve');
    const maxX = 1 + Math.max(...pluck(coords, 0));
    const maxY = 1 + Math.max(...pluck(coords, 1));
    const field = new Array(maxX).fill(0).map(() => new Array(maxY).fill(0));
    const bounds = [[0, 0], [maxX, maxY]];

    function makeOutOfBounds([[minX, minY], [maxX, maxY]]) {
        return ([x, y]) => x < minX || x >= maxX || y < minY || y >= maxY;
    }

    const outOfBounds = makeOutOfBounds(bounds);

    // yield all coordinates around point `(x, y)` of manhatten distance `d`
    function* manhatten(d, [x, y] = [0, 0]) {
        if (d !== 0) yield [x - d, y + 0];
        for (let i = -d + 1; i < d; i++) {
            const r = d - Math.abs(i);
            yield [x + i, y + r];
            yield [x + i, y - r];
        }
        yield [x + d, y + 0];
    }

    // const size = maxX * maxY;
    // let counter = 0;

    for (const dist of range()) {
        // break if no more empty cells within the field
        // if (counter === size) break;
        if (!some(walk2D(field), x => x == 0)) break;
        // if (!flatten(field).some(x => x == 0)) break;

        for (const [index, coord] of coords.entries()) {
            // get all points of manhatten distance `dist` from `coord`
            for (const [cx, cy] of manhatten(dist, coord)) {
                if (outOfBounds([cx, cy])) continue;

                const cell = field[cx][cy];
                if (!cell) {
                    field[cx][cy] = { index, dist };
                    // counter++;
                } else if (cell.dist === dist) {
                    cell.index = -1;
                }
            }
        }
    }
    console.timeEnd('solve');

    const field2 = map2D(field, ({ index }) => index);
    // console.log(field2)

    // delivers all the edge coordinates in clockwise fashion
    // including min, excluding max
    function* edgeCoords([[minX, minY], [maxX, maxY]]) {
        for (let x = minX; x < maxX; x++) yield [x, minY];
        for (let y = minY + 1; y < maxY; y++) yield [maxX - 1, y];
        for (let x = maxX - 2; x >= minX; x--) yield [x, maxY - 1];
        for (let y = maxY - 2; y >= minY + 1; y--) yield [minX, y];
    }

    // we're not interested in letters that touch the edge of the field
    const exclude = new Set(function* () {
        for (const [x, y] of edgeCoords(bounds)) yield field2[x][y];
    }());
    // const exclude = new Set(pipe(
    //     edgeCoords([[0, 0], [maxX, maxY]]),
    //     map(([x, y]) => field2[x][y])
    // ));
    exclude.delete(-1);

    const letters = new Set(walk2D(field2));
    letters.delete(-1);

    deleteAll(letters, exclude);

    // console.log(exclude);
    // console.log(letters);

    const counts = new Map();
    for (const letter of walk2D(field2)) {
        if (letters.has(letter)) {
            counts.set(letter, 1 + (counts.get(letter) || 0));
        }
    }
    const res = [...counts.values()].reduce((a, b) => Math.max(a, b), 0);
    console.log(res);

    // 2
    const manhattenDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);

    // delivers all coordinates within bounds
    // including min, excluding max
    function* allCoords([[minX, minY], [maxX, maxY]]) {
        for (let x = minX; x < maxX; x++) 
            for (let y = minY; y < maxY; y++) 
                yield [x, y];
    }

    const region = [];
    for (const [x, y] of allCoords(bounds)) {
        let total = 0;
        for (const coord of coords) {
            total += manhattenDist([x, y], coord)
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

function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
}

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

function* walk2D(arr2D) {
    for (const row of arr2D)
        for (const cell of row)
            yield cell;
}

function flatten(arr) {
    return arr.reduce((a, x) => a.concat(x), []);
}

function map2D(arr2D, f) {
    return arr2D.map(row => row.map(f));
}

function some(xs, p) {
    for (const x of xs) {
        if (p(x)) return true;
    }
    return false;
}

function deleteAll(A, B) {
    for (const b of B) A.delete(b);
    return A;
}
