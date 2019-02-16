import { pipe, map, replaceWhen } from './iter.mjs';

/**
 * Helper function to read the standard input (or any other stream) 
 * to the end and return as UTF-8 string.
 */
export async function read(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer.toString('utf8');
}

/** 
 * Simple helper to read numeric arguments of the form `<flag> <number>` 
 * from the argument list with fallback values. Mind the empty space between flag and number!
 * E.g. `args(['-w', '-d'], [5, 60])`
 */
export function args(flags, defaults) {
    return pipe(
        flags,
        map(flag => process.argv.findIndex(arg => arg === flag)),
        map(i => process.argv[i + 1]),
        map(Number),
        replaceWhen(Number.isNaN, defaults),
    );
}