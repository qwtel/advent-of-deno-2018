#!/usr/bin/env deno

import { pipe, some, pluck, range, map, filter } from './deps.ts';
import { read, args, flatten, findAndRemove, pad, subtract } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    // Usage: ./7.mjs -d 0 -w 2
    const [BASE_DURATION, NUM_WORKERS] = args(['-d', '-w'], [60, 5]);

    const RE = /Step (\w) must be finished before step (\w) can begin\./;

    const edges = input
        .trim()
        .split('\n')
        .map(line => RE.exec(line).slice(1) as [string, string]);

    // Build a forward and backward graph of the instructions.
    const dirs = new Map<string,string[]>();
    const deps = new Map<string,string[]>();
    for (const [a, b] of edges) {
        dirs.set(a, (dirs.get(a) || []).concat(b).sort());
        deps.set(b, (deps.get(b) || []).concat(a).sort());
    }

    const points = new Set(flatten(edges));
    const destinations = pipe(edges, pluck(1));
    const startingPoints = subtract(points, destinations);

    // 1
    function solve1() {
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
            queue.push(...next.filter(n => !taskInSystem(n)));
            queue.sort();
        }

        return order.join('');
    }

    console.log(solve1());

    // 2
    type Worker = { task?: string, duration: number };

    function solve2() {
        const queue = [...startingPoints].sort();
        const order = [];
        const workers = new Map(pipe(
            range(0, NUM_WORKERS),
            map(n => [n, { task: null, duration: -1 }] as [number, Worker])
        ));

        const depsComplete = task => (deps.get(task) || []).every(d => order.includes(d));
        const taskInSystem = task => queue.includes(task) || order.includes(task);
        const isInProgress = task => pipe(workers.values(), some(({ task: t }) => task === t));

        const getDuration = task => BASE_DURATION + task.charCodeAt(0) - 64;

        for (const sec of range()) {
            const available = pipe(workers, filter(([, w]) => w.task == null));
            for (const [n] of available) {
                const task = findAndRemove(queue, depsComplete);
                if (!task) break;
                const duration = getDuration(task);
                workers.set(n, { task, duration })
            }

            // if (process.env.DEBUG) {
            //     const padf = pad(3, 0);
            //     const status = [...workers].map(([, { task }]) => task || '.').join(' ');
            //     console.log(`${padf(sec)}: ${status}   ${order.join('')}`);
            // }

            if (order.length === points.size) return sec;

            const busy = pipe(workers, filter(([, w]) => w.task != null));
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
    }

    console.log(solve2());
})();
