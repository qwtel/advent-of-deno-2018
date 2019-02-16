import { concat, filter } from './iter.mjs';

export function union(...as) {
    return new Set(concat(...as));
}

export function subtract(as, ...bss) {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => !B.has(a)))(as));
}

export function intersect(as, ...bss) {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => B.has(a)))(as));
}