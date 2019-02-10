#!/usr/bin/env node --experimental-modules

import { read, pipe, map, sum, range, groupBy, mapValues, max, maxBy } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const RE_DATE = /\[(.+)-(.+)-(.+)\ (.+):(.+)\]/;
    const RE_BEGINS = /Guard\ #(\d+) begins shift/;
    const RE_ASLEEP = /falls asleep/;
    const RE_WAKEUP = /wakes up/;

    function parseDate(s) {
        return { date: RE_DATE.exec(s).slice(1).map(Number) };
    }

    function parseType(s) {
        if (RE_ASLEEP.test(s)) {
            return { type: 'asleep' };
        }
        if (RE_WAKEUP.test(s)) {
            return { type: 'wakeup' };
        }
        const [, guard] = RE_BEGINS.exec(s);
        return { type: 'begins', guard: Number(guard) };
    }

    const [, sleepLog] = input
        .trim()
        .split('\n')
        .sort()
        .map(x => [x.substr(0, 18), x.substr(19)])
        .map(([dateStr, typeStr]) => ({
            ...parseDate(dateStr),
            ...parseType(typeStr)
        }))
        .reduce(([guard, log], entry) => {
            switch (entry.type) {
                case 'begins': {
                    return [entry.guard, log];
                }
                case 'asleep': {
                    const { date: [, , , hour, minute] } = entry;
                    return [guard, log.concat({
                        guard,
                        start: hour !== 0 ? 0 : minute,
                    })];
                }
                case 'wakeup': {
                    const prevEntry = log.pop();
                    const { date: [, , , , minute] } = entry;
                    return [guard, log.concat({
                        ...prevEntry,
                        end: minute,
                    })];
                }
            }
        }, [-1, []]);

    const sleepLogByGuard = new Map(pipe(
        sleepLog,
        groupBy(({ guard }) => guard),
    ));

    function getSleepPlan(sleepLog) {
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
        const [guard] = pipe(
            sleepLogByGuard,
            mapValues(log => pipe(
                log, 
                map(({ start, end }) => end - start), 
                sum())),
            maxBy(([, a], [, b]) => a - b)
        );
        const [maxSleepMin] = pipe(
            sleepLogByGuard.get(guard),
            getSleepPlan,
            x => x.entries(),
            maxBy(([, a], [, b]) => a - b),
        );
        console.log(guard * maxSleepMin)
    }

    // 2
    {
        const [guard, [maxSleepTime, sleepPlan]] = pipe(
            sleepLogByGuard,
            mapValues(getSleepPlan),
            mapValues(sleepPlan => [pipe(sleepPlan, max()), sleepPlan]),
            maxBy(([, [a]], [, [b]]) => a - b),
        );
        const maxSleepMin = sleepPlan.findIndex(x => x === maxSleepTime);
        console.log(guard * maxSleepMin);
    }
})();