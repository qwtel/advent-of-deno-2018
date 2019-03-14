#!/usr/bin/env deno

import { range, pipe, filter, map, sort, pairwise, find } from './deps.ts';
import { read, Array2D, Point, arrayCompare, mod } from './util/index.ts';

enum Dir {
    N = '^',
    E = '>',
    S = 'v',
    W = '<',
};

enum Turn {
    Left = -1,
    Streight = 0,
    Right = 1,
};

type Cart = { pos: Point, dir: Dir, turnIndex: number };

const DIRS = [Dir.N, Dir.E, Dir.S, Dir.W];
const TURNS = [Turn.Left, Turn.Streight, Turn.Right];

(async () => {
    const input = await read(Deno.stdin);

    const initialState = Array2D.of(input
        .split('\n')
        .map(r => r.split(''))
    );

    const field = initialState.map(c => {
        switch (c) {
            case '>': return '-';
            case '<': return '-';
            case '^': return '|';
            case 'v': return '|';
            default: return c;
        }
    });

    const initialCarts = [...pipe(
        initialState.entries(),
        filter(([, c]) => DIRS.includes(c as Dir)),
        map(([pos, dir]) => ({ pos, dir: dir, turnIndex: 0 } as Cart)),
    )];

    const comparePos = ({ pos: [ax, ay] }, { pos: [bx, by] }) => arrayCompare([ay, ax], [by, bx]);

    function rotate(dir: Dir, turn: Turn) {
        const i = DIRS.indexOf(dir);
        return DIRS[mod(i + turn, 4)];
    }

    function move([x, y]: Point, dir: Dir): Point {
        switch (dir) {
            case Dir.N: return [x, y - 1];
            case Dir.E: return [x + 1, y];
            case Dir.S: return [x, y + 1];
            case Dir.W: return [x - 1, y];
        }
    }

    const isVert = (x: Dir) => x === Dir.N || x === Dir.S;

    function updateCart(cart: Cart) {
        const territory = field.get(cart.pos);
        switch (territory) {
            case '+': {
                cart.dir = rotate(cart.dir, TURNS[cart.turnIndex]);
                cart.turnIndex = (cart.turnIndex + 1) % 3;
                cart.pos = move(cart.pos, cart.dir);
                return;
            }
            case '-':
            case '|': {
                cart.pos = move(cart.pos, cart.dir);
                return;
            }
            case '/': {
                cart.dir = rotate(cart.dir, isVert(cart.dir) ? Turn.Right : Turn.Left)
                cart.pos = move(cart.pos, cart.dir);
                return;
            }
            case '\\': {
                cart.dir = rotate(cart.dir, isVert(cart.dir) ? Turn.Left : Turn.Right)
                cart.pos = move(cart.pos, cart.dir);
                return;
            }
            default: {
                throw Error('Cart moved onto unknown territory');
            }
        }
    }

    // 1
    {
        const carts: Cart[] = initialCarts.map(({ ...data }) => ({ ...data }));

        let tick: number;
        outerloop: for (tick of range()) {
            // if (process.env.DEBUG) {
            //     console.log(tick);
            //     console.log(printState(field, carts));
            // }
            for (const cart of carts.sort(comparePos)) {
                updateCart(cart);
                if (findDuplicate(carts, comparePos)) break outerloop;
            }
        }
        // if (process.env.DEBUG) {
        //     console.log(tick);
        //     console.log(printState(field, carts));
        // }
        console.log(findDuplicate<Cart>(carts, comparePos)[0].pos.join());
    }

    // 2
    {
        const carts: Cart[] = initialCarts.map(({ ...data }) => ({ ...data }));

        let tick: number;
        outerloop: for (tick of range()) {
            carts.sort(comparePos);

            for (let i = 0; i < carts.length; i++) {
                const cart = carts[i];

                updateCart(cart);

                const duplicate = findDuplicate<Cart>(carts, comparePos);

                if (duplicate) {
                    const [a, b] = duplicate;
                    const j = carts.indexOf(a) === i ? carts.indexOf(b) : carts.indexOf(a);
                    carts.splice(j, 1);
                    if (j < i) i--;
                    carts.splice(i--, 1);
                }
            }

            // if (process.env.DEBUG) {
            //     console.log(tick);
            //     console.log(printState(field, carts));
            // }

            if (carts.length === 1) break outerloop;
        }

        console.log(carts[0].pos.join());
    }
})();

function findDuplicate<X>(xs: Iterable<X>, cf: (a: X, b: X) => number) {
    return pipe(
        xs,
        sort(cf),
        pairwise(),
        find(([a, b]) => cf(a, b) === 0),
    );
}


function printState(field: Array2D<string>, carts: Cart[]) {
    const fieldRepr = field.clone();

    for (const { pos, dir } of carts) {
        if (DIRS.includes(fieldRepr.get(pos) as Dir)) {
            fieldRepr.set(pos, 'X');
        }
        else fieldRepr.set(pos, dir);
    }

    return fieldRepr.map((c, [x, y]) => {
        switch (c) {
            case '^': return '▲';
            case '>': return '▶';
            case 'v': return '▼';
            case '<': return '◀'
            case '+': return '┼';
            case '|': return '│';
            case '-': return '─';
            case '/': {
                const above = field.get([x, y - 1]);
                return ['|', '+', 'v', '^'].includes(above)
                    ? '┘'
                    : '┌';
            }
            case '\\': {
                const above = field.get([x, y - 1]);
                return ['|', '+', 'v', '^'].includes(above)
                    ? '└'
                    : '┐';
            }
            default: return c;
        }
    }).toString();
}
