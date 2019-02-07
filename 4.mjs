#!/usr/bin/env node --experimental-modules

import { read, pipe, find, range, groupBy, mapValues, reduce } from './util.mjs';

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

    const data = input
        .trim()
        .split('\n')
        .sort()
        .map(x => [x.substr(0, 18), x.substr(19)])
        .map(([dateStr, typeStr]) => ({
            ...parseDate(dateStr),
            ...parseType(typeStr)
        }));

    const timeTable = new Map();
    let curr, start;
    for (const d of data) {
        const { type, guard, date: [, , , hour, minute] } = d;
        switch (type) {
            case 'begins': {
                curr = guard;
                break;
            }
            case 'asleep': {
                d.guard = curr; // HACK
                if (hour !== 0) start = 0;
                else start = minute;
                break;
            }
            case 'wakeup': {
                d.guard = curr; // HACK
                const timeAsleep = minute - start;
                timeTable.set(curr, timeAsleep + (timeTable.get(curr) || 0));
            }
        }
    }

    // console.log());
    const maxV = Math.max(...timeTable.values());
    const [maxSleepGuard] = pipe(timeTable, find(([_, v]) => v === maxV));
    const maxSleepOnly = data.filter(({ guard }) => guard === maxSleepGuard);

    function getSleepPlan(data) {
        const sleepPlan = new Array(60).fill(0);
        for (const d of data) {
            const { type, date: [, , , hour, minute] } = d;
            switch (type) {
                case 'asleep': {
                    if (hour !== 0) start = 0;
                    else start = minute;
                    break;
                }
                case 'wakeup': {
                    // console.log(start, minute);
                    for (const m of range(start, minute)) {
                        sleepPlan[m] = 1 + (sleepPlan[m] || 0);
                    }
                }
            }
        }
        return sleepPlan;
    }

    const sleepPlan = getSleepPlan(maxSleepOnly)
    const maxSleepTime = Math.max(...sleepPlan);
    const maxSleepMin = sleepPlan.findIndex(x => x === maxSleepTime);
    console.log(maxSleepGuard * maxSleepMin)

    // 2
    const best = pipe(
        data,
        groupBy(({ guard }) => guard),
        mapValues(getSleepPlan),
        reduce((best, [guard, sleepPlan]) => {
            const maxV = Math.max(...sleepPlan);
            if (maxV > best.maxV) {
                const maxMin = sleepPlan.findIndex(x => x === maxV);
                return { guard, maxV, maxMin };
            }
            return best;
        }, { guard: null, maxV: 0 })
    );
    // console.log(x);
    console.log(best.guard * best.maxMin);
})();