#!/usr/bin/env node --experimental-modules

import { read, pipe, map, min } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

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

    const polymer = input.trim().split('');
    // console.time('solve');
    const res = solve(polymer);
    // console.timeEnd('solve');
    console.log(res.length);


    // 2
    // console.time('solve2');
    const notLetter = letter => x => x !== letter && x.toLowerCase() !== letter;
    const letters = new Set(polymer.map(x => x.toLowerCase()));
    const solution = pipe(
        letters,
        map(l => polymer.filter(notLetter(l))),
        map(solve),
        map(x => x.length),
        min(polymer.length)
    );
    // console.timeEnd('solve2');
    console.log(solution);
})();
