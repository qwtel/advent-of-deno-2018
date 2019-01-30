const fs = require('fs').promises;

(async () => {
    let input = 'dabAcCaCBAcCcaDA';
    input = (await fs.readFile('5.txt', 'utf8')).trim();

    function isReacting(x, y) {
        return Math.abs(x.charCodeAt(0) - y.charCodeAt(0)) === 32
    }

    // suuuuuper slow solution... something like O(n * n)
    // function solve(arr) {
    //     let prevLength = -1;
    //     while (prevLength !== arr.length) {
    //         prevLength = arr.length;
    //         for (const [i, [a, b]] of enumerate(pairwise(arr))) {
    //             if (isReacting(a, b)) {
    //                 arr.splice(i, 2);
    //                 break;
    //             }
    //         }
    //     }
    //     return arr;
    // }

    function getLast(a) {
        return a[a.length - 1];
    }

    // fast solution... O(n)
    function addUnit(polymer, unit) {
        const peek = getLast(polymer);
        if (peek && isReacting(peek, unit)) {
            polymer.pop();
        } else {
            polymer.push(unit)
        }
        return polymer;
    }

    function solve(polymer) {
        return polymer.reduce(addUnit, []);
    }

    const polymer = input.split('');
    console.time('solve');
    const res = solve(polymer);
    console.timeEnd('solve');
    console.log(res.length);


    // 2
    console.time('solve2');
    const notLetter = letter => x => x !== letter && x.toLowerCase() !== letter;
    const letters = new Set(polymer.map(x => x.toLowerCase()));
    const solution = pipe(
        letters,
        map(l => polymer.filter(notLetter(l))),
        map(solve),
        map(x => x.length),
        reduce((a, b) => Math.min(a, b), polymer.length)
    );
    console.timeEnd('solve2');
    console.log(solution);
})();

// function* pairwise(xs) {
//     let prev;
//     for (const x of xs) {
//         if (prev) yield [prev, x];
//         prev = x;
//     }
// }

// function* enumerate(xs) {
//     let i = 0;
//     for (const x of xs) {
//         yield [i++, x];
//     }
// }

function pipe(coll, ...fs) {
    let res = coll;
    for (const f of fs) {
        res = f(res);
    }
    return res;
}

function map(f) {
    return function* (xs) {
        for (const x of xs) yield f(x);
    }
}

function reduce(f, init) {
    return function (xs) {
        let res = init;
        for (const x of xs) {
            res = f(res, x);
        }
        return res;
    }
}