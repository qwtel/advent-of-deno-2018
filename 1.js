const fs = require('fs').promises;

(async () => {
    const input = (await fs.readFile('1.txt', 'utf8'))
        .trim()
        .split('\n')
        .map(Number);

    // const reductions = input.reduce((a, x) => (a.push(a[a.length - 1] + x), a), [0]);
    // console.log(reductions[reductions.length - 1]);

    const add = (a, b) => a + b;
    const res = input.reduce(add, 0);
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