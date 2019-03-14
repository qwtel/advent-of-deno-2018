#!/usr/bin/env deno

import { read, add } from './util/index.ts';

(async () => {
    const input = await read(Deno.stdin);

    const treeInput = input.trim().split(' ').map(Number);

    // 1
    function walkTree(it: Iterator<number>) {
        const [a, b] = [it.next().value, it.next().value];
        let num = 0;
        for (let i = 0; i < a; i++) num += walkTree(it);
        for (let j = 0; j < b; j++) num += it.next().value;
        return num;
    }

    console.log(walkTree(treeInput[Symbol.iterator]()));

    // 2
    type Tree = { letter?: string, children: Tree[], meta: number[] };

    function buildTree(it: Iterator<number>, c = 0): Tree {
        const letter = String.fromCharCode(c + 65);
        const children: Tree[] = [];
        const meta: number[] = [];
        const [a, b] = [it.next().value, it.next().value];
        for (let i = 0; i < a; i++) children.push(buildTree(it, ++c));
        for (let j = 0; j < b; j++) meta.push(it.next().value);
        return { letter, children, meta };

    }

    function countStuff({ children, meta }: Tree): number {
        if (!children.length) return meta.reduce(add, 0);
        return meta
            .map(i => children[i - 1])
            .filter(x => x)
            .map(c => countStuff(c))
            .reduce(add, 0);
    }

    const tree = buildTree(treeInput[Symbol.iterator]());
    // if (process.env.DEBUG) console.log(tree);

    console.log(countStuff(tree));
})();
