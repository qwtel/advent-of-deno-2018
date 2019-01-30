const fs = require('fs').promises;

const { pipe, reduce, pluck, range, subtract, Array2D } = require('./util.js');

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
        // if (!pipe(walk2D(field), some(x => x == 0))) break;
        // if (!flatten(field).some(x => x == 0)) break;

        for (const [index, coord] of coords.entries()) {
            // get all points of manhatten distance `dist` from `coord`
            for (const p of manhatten(dist, coord)) {
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
    // console.log(field2)

    // we're not interested in letters that touch the edge of the field
    const excluded = new Set(field2.edgeValues());
    const letters = new Set(field2);
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

    const region = [];
    for (const [x, y] of field2.coords()) {
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
