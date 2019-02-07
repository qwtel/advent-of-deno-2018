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

    // fast solution... O(n)
    function addUnit(polymer, b) {
        const a = polymer.pop();
        if (!a) polymer.push(b);
        else if (!isReacting(a, b)) polymer.push(a, b);
        return polymer;
    }

    function solve(polymer) {
        return polymer.reduce(addUnit, []);
    }

    const polymer = input.trim().split('');
    const res = solve(polymer);
    console.log(res.length);


    // 2
    const notLetter = letter => x => x !== letter && x.toLowerCase() !== letter;
    const letters = new Set(polymer.map(x => x.toLowerCase()));
    const solution = pipe(
        letters,
        map(l => polymer.filter(notLetter(l))),
        map(solve),
        map(x => x.length),
        min(polymer.length)
    );
    console.log(solution);
})();
