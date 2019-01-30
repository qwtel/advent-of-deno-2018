const fs = require('fs').promises;

const { pipe, map, reduce, pluck, range, walk2D, map2D, subtract, Array2D } = require('./util.js');

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

    // console.time('solve');
    const maxX = 1 + Math.max(...pipe(coords, pluck(0)));
    const maxY = 1 + Math.max(...pipe(coords, pluck(1)));
    const field = new Array2D(maxX, maxY);
    // const field = new Array(maxX).fill(0).map(() => new Array(maxY).fill(0));
    const bounds = [[0, 0], [maxX, maxY]];

    function makeOutOfBounds([[minX, minY], [maxX, maxY]]) {
        return ([x, y]) => x < minX || x >= maxX || y < minY || y >= maxY;
    }

    const outOfBounds = makeOutOfBounds(bounds);

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
        // if (!pipe(walk2D(field), some(x => x == 0))) break;
        // if (!flatten(field).some(x => x == 0)) break;

        for (const [index, coord] of coords.entries()) {
            // get all points of manhatten distance `dist` from `coord`
            for (const p of manhatten(dist, coord)) {
                if (outOfBounds(p)) continue;

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
    const excluded = new Set(pipe(
        edgeCoords([[0, 0], [maxX, maxY]]),
        map(p => field2.get(p))
    ));
    excluded.delete(-1);

    const letters = new Set(field2);
    letters.delete(-1);

    const included = subtract(letters, excluded);

    // console.log(exclude);
    // console.log(letters);

    const counts = new Map();
    for (const letter of field2) {
        if (included.has(letter)) {
            counts.set(letter, 1 + (counts.get(letter) || 0));
        }
    }
    const res = pipe(counts.values(), reduce((a, b) => Math.max(a, b), 0));
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
