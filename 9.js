// const fs = require('fs').promises;
const immutable = require('immutable');

const { pipe, range, map, makeIncWrapped } = require('./util.js');

(async () => {
    function solve(numPlayers, lastRound) {
        const circle = [0];
        const scores = new Map(pipe(range(0, numPlayers), map(x => [x, 0])));
        let c = 0;
        let p = 0;

        const incPlayer = makeIncWrapped(numPlayers);

        for (const turn of range(1, lastRound + 1)) {
            // if (turn % 10000 == 0) console.log(turn);

            p = incPlayer(p);

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
        }
        return scores;
    }

    // sloooooow
    function solveImmutable(numPlayers, lastRound) {
        const incPlayer = makeIncWrapped(numPlayers);

        function gameLoop({ current, player, circle, scores }, turn) {
            // if (turn % 10000 == 0) console.log(turn);

            const nextPlayer = incPlayer(player);

            function addMarble() {
                const next = current + 2 === circle.size + 1 
                    ? 1
                    : current + 2
                const nextCircle = circle.splice(next, 0, turn);
                return [next, nextCircle, scores];
            }

            function removeMarble() {
                const removeIndex = current - 7 < 0 
                    ? circle.size + (current - 7)
                    : current - 7

                const score = circle.get(removeIndex);
                const nextCircle = circle.splice(removeIndex, 1);
                const nextScores = scores.set(nextPlayer, scores.get(nextPlayer) + turn + score);

                return [removeIndex, nextCircle, nextScores];
            }

            const [next, nextCircle, nextScores] = turn % 23 === 0 
                ? removeMarble()
                : addMarble();

            // console.log(`[${p + 1}]`, circle
            //     .map((x, i) => c === i ? `(${x})` : `${x} `)
            //     .map(x => pad(4, ' ')(x)).join('')
            // );

            return { 
                current: next, 
                player: nextPlayer, 
                circle: nextCircle, 
                scores: nextScores 
            };
        }

        return pipe(
            range(1, lastRound + 1),
            reduce(gameLoop, {
                current: 0,
                player: 0,
                circle: immutable.List([0]),
                scores: immutable.Map(pipe(range(0, numPlayers), map(x => [x, 0]))),
            })
        ).scores;
    }

    // console.log(Math.max(...solveImmutable(9, 25).values()));

    // console.log(Math.max(...solveImmutable(10, 1618).values()));
    // console.log(Math.max(...solveImmutable(13, 7999).values()));
    // console.log(Math.max(...solveImmutable(17, 1104).values()));
    // console.log(Math.max(...solveImmutable(21, 6111).values()));
    // console.log(Math.max(...solveImmutable(30, 5807).values()));

    console.log(Math.max(...solve(428, 70825).values()));
    // console.log(Math.max(...solveImmutable(428, 70825).values()));

    // console.log(Math.max(...solve2(428, 70825 * 100).values()));

})();