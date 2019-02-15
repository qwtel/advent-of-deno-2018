#!/usr/bin/env node --experimental-modules

import { read, Array2D, range, pipe, filter, map, arrayCompare, sort, pairwise, find, mod } from './util.mjs';

(async () => {
    const input = await read(process.stdin);

    const HL = '─';
    const VL = '│';
    const NW = '┌';
    const SW = '└';
    const NE = '┐';
    const SE = '┘';
    const CR = '┼';

    const N = '▲';
    const E = '▶';
    const S = '▼';
    const W = '◀';

    const DIRS = [N, E, S, W];

    const LEFT = -1;
    const STRAIGHT = 0;
    const RIGHT = 1;

    const TURN_TABLE = [LEFT, STRAIGHT, RIGHT];

    const initialState = Array2D.of(input
        .split('\n')
        .map(r => r.split(''))
    );

    const field = initialState.map((c, [x, y]) => {
        switch (c) {
            case '+': return CR;
            case 'v':
            case '^':
            case '|': return VL;
            case '<':
            case '>':
            case '-': return HL;
            case '/': {
                const above = initialState.get([x, y - 1]);
                return ['|', '+', 'v', '^'].includes(above)
                    ? SE
                    : NW;
            }
            case '\\': {
                const above = initialState.get([x, y - 1]);
                return ['|', '+', 'v', '^'].includes(above)
                    ? SW
                    : NE;
            }
            default: return c;
        }
    });

    const dirMap = new Map([
        ['^', N],
        ['>', E],
        ['v', S],
        ['<', W],
    ]);

    const initialCarts = [...pipe(
        initialState.entries(),
        filter(([, c]) => [...dirMap.keys()].includes(c)),
        map(([pos, dir]) => ({
            pos,
            dir: dirMap.get(dir),
            turnIndex: 0
        })),
    )];

    const comparePos = ({ pos: [ax, ay] }, { pos: [bx, by] }) =>
        arrayCompare([ay, ax], [by, bx]);

    function rotate(dir, turn) {
        const i = DIRS.indexOf(dir);
        return DIRS[mod(i + turn, 4)];
    }

    function move([x, y], dir) {
        switch (dir) {
            case N: return [x, y - 1];
            case E: return [x + 1, y];
            case S: return [x, y + 1];
            case W: return [x - 1, y];
        }
    }

    const isVert = x => x === N || x === S;

    function updateCart(cart) {
        const territory = field.get(cart.pos);
        switch (territory) {
            case CR: {
                cart.dir = rotate(cart.dir, TURN_TABLE[cart.turnIndex]);
                cart.turnIndex = (cart.turnIndex + 1) % 3;
                cart.pos = move(cart.pos, cart.dir);
                return cart;
            }
            case VL:
            case HL: {
                cart.pos = move(cart.pos, cart.dir);
                return cart;
            }
            case SE:
            case NW: {
                cart.dir = rotate(cart.dir, isVert(cart.dir) ? RIGHT : LEFT)
                cart.pos = move(cart.pos, cart.dir);
                return cart;
            }
            case SW:
            case NE: {
                cart.dir = rotate(cart.dir, isVert(cart.dir) ? LEFT : RIGHT)
                cart.pos = move(cart.pos, cart.dir);
                return cart;
            }
            default: {
                throw Error('Cart moved onto unknown territory');
            }
        }
    }

    function printState(carts) {
        const fieldRepr = field.clone();
        for (const { pos, dir } of carts) {
            if (DIRS.includes(fieldRepr.get(pos))) fieldRepr.set(pos, 'X');
            else fieldRepr.set(pos, dir);
        }
        return fieldRepr.toString();
    }

    // 1
    {
        const carts = initialCarts.map(({ ...data }) => ({ ...data }));

        let tick;
        outerloop: for (tick of range()) {
            if (process.env.DEBUG) {
                console.log(tick);
                console.log(printState(carts));
            }
            for (const cart of carts.sort(comparePos)) {
                updateCart(cart);
                if (findDuplicate(carts, comparePos)) break outerloop;
            }
        }
        if (process.env.DEBUG) {
            console.log(tick);
            console.log(printState(carts));
        }
        console.log(findDuplicate(carts, comparePos)[0].pos.join());
    }

    // 2
    {
        const carts = initialCarts.map(({ ...data }) => ({ ...data }));

        let tick;
        outerloop: for (tick of range()) {
            carts.sort(comparePos);

            for (let i = 0; i < carts.length; i++) {
                const cart = carts[i];

                updateCart(cart);

                const duplicate = findDuplicate(carts, comparePos);

                if (duplicate) {
                    const [a, b] = duplicate;
                    const j = carts.indexOf(a) === i ? carts.indexOf(b) : carts.indexOf(a);
                    carts.splice(j, 1);
                    if (j < i) i--;
                    carts.splice(i--, 1);
                }
            }

            if (process.env.DEBUG) {
                console.log(tick);
                console.log(printState(carts));
            }

            if (carts.length === 1) break outerloop;
        }

        console.log(carts[0].pos.join());
    }
})();

// There's quicker ways to find duplicates, but we don't care
function findDuplicate(xs, cf = (a, b) => a - b) {
    return pipe(
        xs,
        sort(cf),
        pairwise(),
        find(([a, b]) => cf(a, b) === 0),
    );
}
