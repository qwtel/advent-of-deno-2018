#!/usr/bin/env deno

import { pipe, map, reduce, sum, range, groupBy, mapValues, max, maxBy } from './deps.ts';
import { read } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);
    const lines = input.trim().split('\n');

    const RE_DATE = /\[(.+)-(.+)-(.+)\ (.+):(.+)\]/;
    const RE_BEGINS = /Guard\ #(\d+) begins shift/;
    const RE_ASLEEP = /falls asleep/;
    const RE_WAKEUP = /wakes up/;

    function parseDate(s: string) {
        return { date: RE_DATE.exec(s).slice(1).map(Number) };
    }

    enum Action { Asleep, Wakeup, Begins }

    function parseAction(s: string): { action: Action, guard?: number } {
        if (RE_ASLEEP.test(s)) {
            return { action: Action.Asleep };
        }
        if (RE_WAKEUP.test(s)) {
            return { action: Action.Wakeup };
        }
        const [, guard] = RE_BEGINS.exec(s);
        return { action: Action.Begins, guard: Number(guard) };
    }

    type LogEntry = { guard: number, start: number, end?: number };
    type Log = LogEntry[];

    const [, sleepLog] = pipe(
        lines.sort(),
        map(x => [x.substr(0, 18), x.substr(19)]),
        map(([dateStr, actionString]) => ({
            ...parseDate(dateStr),
            ...parseAction(actionString)
        })),
        reduce(([guard, log]: [number, Log], entry) => {
            switch (entry.action) {
                case Action.Begins: {
                    return [entry.guard, log];
                }
                case Action.Asleep: {
                    const { date: [, , , hour, minute] } = entry;
                    return [guard, log.concat({
                        guard,
                        start: hour !== 0 ? 0 : minute,
                    })];
                }
                case Action.Wakeup: {
                    const { guard, start } = log.pop();
                    const { date: [, , , , minute] } = entry;
                    return [guard, log.concat({
                        guard, 
                        start,
                        end: minute,
                    })];
                }
            }
        }, [-1, []]),
    ) as [{}, Log];

    const sleepLogByGuard = new Map(pipe(
        sleepLog,
        groupBy(({ guard }) => guard),
    ));

    function getSleepPlan(sleepLog: Log): number[] {
        const sleepPlan = new Array(60).fill(0);
        for (const entry of sleepLog) {
            const { start, end } = entry;
            for (const m of range(start, end)) {
                sleepPlan[m] = 1 + (sleepPlan[m] || 0);
            }
        }
        return sleepPlan;
    }

    // 1
    {
        const [guard]: [number, number] = pipe(
            sleepLogByGuard,
            mapValues(log => pipe(
                log,
                map(({ start, end }) => end - start),
                sum())),
            maxBy(([, a], [, b]) => a - b)
        );

        const [maxSleepMin]: [number, number] = pipe(
            sleepLogByGuard.get(guard),
            getSleepPlan,
            x => x.entries(),
            maxBy(([, a], [, b]) => a - b),
        );
        console.log(guard * maxSleepMin)
    }

    // 2
    {
        const [guard, [maxSleepTime, sleepPlan]]: [number, [number, number[]]] = pipe(
            sleepLogByGuard,
            mapValues(getSleepPlan),
            mapValues(sleepPlan => [
                max()(sleepPlan), 
                sleepPlan
            ] as [number, number[]]),
            maxBy(([, [a]], [, [b]]) => a - b),
        );

        const maxSleepMin = sleepPlan.findIndex(x => x === maxSleepTime);
        console.log(guard * maxSleepMin);
    }
})();
