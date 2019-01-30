const fs = require('fs').promises;

const { pipe, find, range, groupBy, mapValues, reduce } = require('./util.js');

(async () => {
//     const input = `
// [1518-11-01 00:00] Guard #10 begins shift
// [1518-11-01 00:05] falls asleep
// [1518-11-01 00:25] wakes up
// [1518-11-01 00:30] falls asleep
// [1518-11-01 00:55] wakes up
// [1518-11-01 23:58] Guard #99 begins shift
// [1518-11-02 00:40] falls asleep
// [1518-11-02 00:50] wakes up
// [1518-11-03 00:05] Guard #10 begins shift
// [1518-11-03 00:24] falls asleep
// [1518-11-03 00:29] wakes up
// [1518-11-04 00:02] Guard #99 begins shift
// [1518-11-04 00:36] falls asleep
// [1518-11-04 00:46] wakes up
// [1518-11-05 00:03] Guard #99 begins shift
// [1518-11-05 00:45] falls asleep
// [1518-11-05 00:55] wakes up
//         `;
    const input = await fs.readFile('4.txt', 'utf8');

    const RE_DATE = /\[(.+)-(.+)-(.+)\ (.+):(.+)\]/;
    const RE_BEGINS = /Guard\ #(\d+) begins shift/;
    const RE_ASLEEP = /falls asleep/;
    const RE_WAKEUP = /wakes up/;

    function getDate(r) {
        return RE_DATE.exec(r).slice(1).map(Number);
    }

    function getType(r) {
        if (RE_ASLEEP.test(r)) {
            return { type: 'asleep' };
        }
        if (RE_WAKEUP.test(r)) {
            return { type: 'wakeup' };
        }
        const [, guard] = RE_BEGINS.exec(r);
        return { type: 'begins', guard: Number(guard) };
    }

    const data = input
        .trim()
        .split('\n')
        .sort()
        .map(x => [x.substr(0, 18), x.substr(19)])
        .map(([dateStr, str]) => ({
            date: getDate(dateStr),
            ...getType(str)
        }))
        // .sort((a, b) => arrayCompare(a.date, b.date));

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
    let best = pipe(
        data,
        groupBy(({ guard }) => guard),
        mapValues(getSleepPlan),
        reduce((best, [guard, sleepPlan]) => {
            const maxV = Math.max(...sleepPlan);
            if (maxV > best.maxV) {
                const maxMin = sleepPlan.findIndex(x => x === maxV);
                return { maxV, guard, maxMin };
            }
            return best;
        }, { guard: null, maxV: 0 })
    );
    // console.log(x);
    console.log(best.guard * best.maxMin);
})();