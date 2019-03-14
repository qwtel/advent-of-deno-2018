#!/usr/bin/env deno

import { pipe, map, min } from './deps.ts';
import { read } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);
    const polymer = input.trim().split('');

    function isReacting(x, y) {
        return Math.abs(x.charCodeAt(0) - y.charCodeAt(0)) === 32
    }

    function addUnit(polymer, b) {
        const a = polymer.pop();
        if (!a) polymer.push(b);
        else if (!isReacting(a, b)) polymer.push(a, b);
        return polymer;
    }

    function solve(polymer) {
        return polymer.reduce(addUnit, []);
    }

    // 1
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
        min()
    );
    console.log(solution);

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
})();
