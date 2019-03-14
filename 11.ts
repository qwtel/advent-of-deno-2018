#!/usr/bin/env deno

import { range, pipe, map, tap, forEach, filter, sum, product2, maxBy, maxByScan, distinctUntilChanged } from './deps.ts';
import { read, Array2D } from './util/index.ts';

(async () => {
    const input = Number(await read(Deno.stdin));

    const hundredthDigit = (n: number) => {
        const s = String(n);
        return Number(s[s.length - 3]);
    };

    const grid = (new Array2D([[1, 1], [301, 301]])).map((_, [x, y]) => {
        const rackId = x + 10;
        let powerLevel = rackId * y;
        powerLevel += input;
        powerLevel *= rackId;
        powerLevel = hundredthDigit(powerLevel);
        powerLevel -= 5;
        return powerLevel;
    });

    type Point = [number, number];

    function get3x3([x, y]: Point) {
        return product2([...range(x, x + 3)], [...range(y, y + 3)]);
    }

    function getNxN([x, y]: Point, n = 3) {
        return product2([...range(x, x + n)], [...range(y, y + n)]);
    }

    // 1
    pipe(
        grid.coords(),
        filter(([x, y]) => x < 298 && y < 298),
        map(p => [p, pipe(
            get3x3(p),
            map(p => grid.get(p)),
            sum(),
        )] as [Point, number]),
        maxBy(([, a], [, b]) => a - b),
        ([p]) => console.log(p.join()),
    );

    // 2
    // let lastN = 0;

    type PointN = [number, number, number];

    pipe(
        product2([...range(1, 32)], [...grid.coords()]),
        filter(([n, [x, y]]) => x < 301 - n && y < 301 - n),
        map(([n, [x, y]]) => [[x, y, n], pipe(
            getNxN([x, y], n),
            map(p => grid.get(p)),
            sum(),
        )] as [PointN, number]),
        /*process.env.DEBUG 
            ? tap(([[, , n]]) => { if (n != lastN) { console.log(n); lastN = n; } })
            : _ => _, */
        /*process.env.DEBUG 
            ? maxByScan(([, a], [, b]) => a - b)
            :*/ maxBy(([, a], [, b]) => a - b),
        /*process.env.DEBUG 
            ? forEach(([x, y]) => console.log([x.join(), y]))
            :*/ ([x]) => console.log(x.join()),
    );


    // Failed attempt at using memoization to speed up computation...

    // ##%
    // ##%
    // $$x

    // ###%%
    // ###%%
    // ###%%
    // $$$xx
    // $$$xx

    // ####%%%
    // ####%%%
    // ####%%%
    // ####%%%
    // $$$$xxx
    // $$$$xxx
    // $$$$xxx

    // function memoize(f) {
    //     const rs = new Map();
    //     return (...args) => {
    //         const k = args.join('');
    //         const r = rs.get(k);
    //         if (r !== undefined) return r;
    //         // else...
    //         const v = f(...args);
    //         rs.set(k, v);
    //         return v;
    //     }
    // }

    // const calcSum = memoize((x, y, w, h) => {
    //     if (w === 0 || h === 0) return 0;
    //     // console.log(`(${x},${y}) (${w},${h})`);
    //     if (w === 1 && h === 1) return grid.get([x, y]);
    //     const w2f = Math.floor(w / 2);
    //     const h2f = Math.floor(h / 2);
    //     const w2c = Math.ceil(w / 2);
    //     const h2c = Math.ceil(h / 2);
    //     return (
    //         calcSum(x, y, w2c, h2c) +
    //         calcSum(x + w2c, y, w2f, h2c) +
    //         calcSum(x, y + h2c, w2c, h2f) +
    //         calcSum(x + w2c, y + h2c, w2f, h2f)
    //     );
    // });

})();
