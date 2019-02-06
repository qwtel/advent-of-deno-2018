const { streamToString } = require('./util.js');

(async () => {
    const input = (await streamToString(process.stdin))
        .trim()
        .split('\n')
        .map(Number);

    // const reductions = input.reduce((a, x) => (a.push(a[a.length - 1] + x), a), [0]);
    // console.log(reductions[reductions.length - 1]);

    const res = input.reduce((a, b) => a + b, 0);
    console.log(res);

    let freqs = new Set();
    let acc = 0;
    let i = 0;
    while (true) {
        acc += input[i];
        if (freqs.has(acc)) {
            console.log(acc);
            break;
        }
        freqs.add(acc);
        i++;
        if (i === input.length) i = 0;
    }

})();