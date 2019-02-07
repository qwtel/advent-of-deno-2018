#!/usr/bin/env node --experimental-modules

import { read, pipe, range, map } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const RE = /(\d+) players; last marble is worth (\d+) points/;

    const [numPlayers, lastRound] = RE.exec(input).slice(1).map(Number);

    // Solution too slow for large inputs :/
    function solve(numPlayers, lastRound) {
        const circle = [0];
        const scores = new Map(pipe(range(0, numPlayers), map(x => [x, 0])));
        let c = 0;
        let p = 0;

        for (const turn of range(1, lastRound + 1)) {
            // if (turn % 10000 == 0) console.log(turn);

            if (turn % 23 === 0) {
                let ri = c - 7;
                if (ri < 0) ri = circle.length + ri;

                const [score] = circle.splice(ri, 1);
                scores.set(p, scores.get(p) + turn + score);

                c = ri;
                if (c === circle.length) c = 0;
            } else {
                c += 2;
                if (c === circle.length + 1) c = 1;
                circle.splice(c, 0, turn);
            }

            // console.log(`[${p + 1}]`, circle
            //     .map((x, i) => c === i ? `(${x})` : `${x} `)
            //     .map(x => pad(4, ' ')(x)).join('')
            // );

            p = (p + 1) % numPlayers;
        }
        return scores;
    }

    console.log(Math.max(...solve(numPlayers, lastRound).values()));

    // sloooooow
    // function solveImmutable(numPlayers, lastRound) {
    //     const incPlayer = makeIncWrapped(numPlayers);

    //     function gameLoop({ current, player, circle, scores }, turn) {
    //         // if (turn % 10000 == 0) console.log(turn);

    //         const nextPlayer = incPlayer(player);

    //         function addMarble() {
    //             const next = current + 2 === circle.size + 1 
    //                 ? 1
    //                 : current + 2
    //             const nextCircle = circle.splice(next, 0, turn);
    //             return [next, nextCircle, scores];
    //         }

    //         function removeMarble() {
    //             const removeIndex = current - 7 < 0 
    //                 ? circle.size + (current - 7)
    //                 : current - 7

    //             const score = circle.get(removeIndex);
    //             const nextCircle = circle.splice(removeIndex, 1);
    //             const nextScores = scores.set(nextPlayer, scores.get(nextPlayer) + turn + score);

    //             return [removeIndex, nextCircle, nextScores];
    //         }

    //         const [next, nextCircle, nextScores] = turn % 23 === 0 
    //             ? removeMarble()
    //             : addMarble();

    //         // console.log(`[${p + 1}]`, circle
    //         //     .map((x, i) => c === i ? `(${x})` : `${x} `)
    //         //     .map(x => pad(4, ' ')(x)).join('')
    //         // );

    //         return { 
    //             current: next, 
    //             player: nextPlayer, 
    //             circle: nextCircle, 
    //             scores: nextScores 
    //         };
    //     }

    //     return pipe(
    //         range(1, lastRound + 1),
    //         reduce(gameLoop, {
    //             current: 0,
    //             player: 0,
    //             circle: immutable.List([0]),
    //             scores: immutable.Map(pipe(range(0, numPlayers), map(x => [x, 0]))),
    //         })
    //     ).scores;
    // }

})();