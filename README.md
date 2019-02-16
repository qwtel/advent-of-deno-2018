# Advent of ES
JavaScript solutions for [Advent of Code 2018][AoC] using the latest ECMAScript features, specifically generators and iterators.

[AoC]: https://adventofcode.com/2018

## Run
Requires node 11+. Input via `stdin`, e.g. 

    cat input/01.txt | ./01.mjs

`.mjs` files are exectutable to avoid having to type `node --experimental-modules` over and over again.

## Not your granpa's JS
With generators, complex computations can be represented using functional building blocks. For example, finding the first duplicate in an (infinite) series of additions can be expressed as:

~~~js
console.log(pipe(
    cycle(input),
    scan((a, b) => a + b, 0),
    scan((seen, freq) => 
        seen.has(freq)
            ? { reduced: freq }
            : seen.add(freq),
        new Set(),
    ),
    find(({ reduced }) => reduced),
).reduced);
~~~

Thanks to the pull-based nature of iterators, we can start with an infinite series (`cycle(input)`) but stop producing new items as soon as we `find` a result.

In other words, the above solution does not run any more iterations as a more verbose implementation using an infinite loop.

~~~js
const seen = new Set();
let freq = 0;
let i = 0;
while (true) {
    freq += input[i];
    if (seen.has(freq)) {
        console.log(freq);
        break;
    }
    seen.add(freq);
    i = (i + 1) % input.length;
}
~~~

Why is the first solution "better"? It's really a matter of taste, but personally I prefer the fact that each idea is expressed separately. I.e. the cycling of the input is one line instead of explicitly incrementing and wrapping and index, as is the lookup in the set, etc...

Obviously the first implementation requires a variety of helper functions such as `pipe`, `scan`, `find`, etc. However, as a look at [`util.mjs`](./util/iter.mjs) will show, they are suprisingly compact and easy to implement using generator functions.

### Further Reading

* [Solving Advent of Code Puzzeles with ES Generators](https://qwtel.com/posts/software/solving-advent-of-code-puzzeles-with-es-generators/)