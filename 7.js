const fs = require('fs').promises;

const { pipe, some, pluck, findAndRemove, range, map, partition, subtract, pad } = require('./util.js');

(async () => {
    let input = `
Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.
`;
    let BASE_DURATION = 0;
    let NUM_WORKERS = 2;

    input = (await fs.readFile('7.txt', 'utf8')).trim();
    BASE_DURATION = 60;
    NUM_WORKERS = 5;

    const RE = /Step (\w) must be finished before step (\w) can begin./;

    const edges = input.trim().split('\n').map(line => RE.exec(line).slice(1));

    // Build a forward and backward graph of the instructions.
    const dirs = new Map();
    const deps = new Map();
    for (const [a, b] of edges) {
        dirs.set(a, (dirs.get(a) || []).concat(b).sort());
        deps.set(b, (deps.get(b) || []).concat(a).sort());
    }

    // console.log(dirs);
    // console.log(deps);

    const points = new Set(edges.reduce((a, x) => a.concat(x), []));
    const destin = new Set(pipe(edges, pluck(1)));
    const startingPoints = subtract(points, destin);

    {
        const queue = [...startingPoints].sort();
        const order = [];

        const depsComplete = task => (deps.get(task) || []).every(d => order.includes(d));

        while (queue.length) {
            // Find the first element in the queue that has all it's dependencies satisfied
            const curr = findAndRemove(queue, x => depsComplete(x));

            order.push(curr);

            // Add next potential steps to the queue, 
            // unless they're already in the queue or completed.
            const next = (dirs.get(curr) || []).filter(n =>
                !queue.includes(n) && !order.includes(n)
            );
            for (const n of next) queue.push(n);

            queue.sort();
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
        const isInProgress = task => pipe(workers.values(), some(({ task: t }) => task === t));
        const taskDuration = task => BASE_DURATION + task.charCodeAt(0) - 64;

        let lastSec;
        for (const sec of range()) {
            const [available, busy] = pipe(workers, partition(([, w]) => w.task === null));

            for (const [n] of available) {
                const task = findAndRemove(queue, t => depsComplete(t));
                if (!task) continue;

                const duration = taskDuration(task);
                workers.set(n, { task, duration })
            }

            // console.log(`${pad(3)(sec)}: ${[...workers].map(([, { task }]) => task || '.').join(' ')}   ${order.join('')}`);

            lastSec = sec;
            if (order.length === points.size) break;

            for (const [n, state] of busy) {
                state.duration--;

                if (state.duration === 0) {
                    workers.set(n, { task: null, duration: -1 });

                    order.push(state.task);

                    const next = (dirs.get(state.task) || []).filter(n =>
                        !queue.includes(n) && !order.includes(n) && !isInProgress(n)
                    );
                    for (const n of next) queue.push(n);
                }
            }
            queue.sort();
        }

        console.log(lastSec);
    }
})();