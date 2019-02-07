#!/usr/bin/env node --experimental-modules

import { read, pipe, some, pluck, flatten, findAndRemove, range, map, fillGaps, partition, subtract, } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const dIndex = process.argv.findIndex(x => x === '-d');
    const wIndex = process.argv.findIndex(x => x === '-w');
    const [BASE_DURATION, NUM_WORKERS] = pipe(
        [dIndex + 1, wIndex + 1],
        map(i => process.argv[i]),
        map(Number),
        fillGaps([60, 5], [NaN])
    );

    const RE = /Step (\w) must be finished before step (\w) can begin\./;

    const edges = input.trim().split('\n').map(line => RE.exec(line).slice(1));

    // Build a forward and backward graph of the instructions.
    const dirs = new Map();
    const deps = new Map();
    for (const [a, b] of edges) {
        dirs.set(a, (dirs.get(a) || []).concat(b).sort());
        deps.set(b, (deps.get(b) || []).concat(a).sort());
    }

    const points = new Set(flatten(edges));
    const destinations = pipe(edges, pluck(1));
    const startingPoints = subtract(points, destinations);

    // 1
    {
        const queue = [...startingPoints].sort();
        const order = [];

        const depsComplete = task => (deps.get(task) || []).every(d => order.includes(d));
        const taskInSystem = task => queue.includes(task) || order.includes(task);

        while (queue.length) {
            // Find the first element in the queue that has all it's dependencies satisfied
            const curr = findAndRemove(queue, depsComplete);

            order.push(curr);

            // Add next potential steps to the queue, 
            // unless they're already in the queue or completed.
            const next = dirs.get(curr) || [];
            queue.push(...next.filter(n => !taskInSystem(n))).sort();
        }

        console.log(order.join(''));
    }

    // 2
    {
        const queue = [...startingPoints].sort();
        const order = [];
        const workers = new Map(pipe(
            range(0, NUM_WORKERS),
            map(n => [n, { task: null, duration: -1 }])
        ));

        const depsComplete = task => (deps.get(task) || []).every(d => order.includes(d));
        const taskInSystem = task => queue.includes(task) || order.includes(task);
        const isInProgress = task => pipe(workers.values(), some(({ task: t }) => task === t));

        const getDuration = task => BASE_DURATION + task.charCodeAt(0) - 64;

        let lastSec;
        for (const sec of range()) {
            const [available, busy] = pipe(workers, partition(([, w]) => w.task === null));

            for (const [n] of available) {
                const task = findAndRemove(queue, depsComplete);
                if (!task) break;

                workers.set(n, { task, duration: getDuration(task) })
            }

            // console.log(`${pad(3)(sec)}: ${[...workers].map(([, { task }]) => task || '.').join(' ')}   ${order.join('')}`);

            lastSec = sec;
            if (order.length === points.size) break;

            for (const [n, state] of busy) {
                state.duration--;

                if (state.duration === 0) {
                    workers.set(n, { task: null, duration: -1 });

                    order.push(state.task);

                    const next = dirs.get(state.task) || [];
                    queue.push(...next.filter(n => !taskInSystem(n) && !isInProgress(n)));
                }
            }
            queue.sort();
        }

        console.log(lastSec);
    }
})();