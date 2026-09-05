'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);

function sourceFunction(name, nextName) {
    const start = source.indexOf(`function ${name}`);
    const end = source.indexOf(`function ${nextName}`, start);
    assert(start >= 0 && end > start, `Could not load ${name}`);
    return source.slice(start, end);
}

const context = {
    nullableTick(value) {
        return Number.isFinite(value) ? value : null;
    },
    cueValue(cue, pascal, camel) {
        return cue && cue[pascal] !== undefined ? cue[pascal] : cue && cue[camel];
    }
};
vm.createContext(context);
vm.runInContext(
    sourceFunction('normalizedCueTextRanges', 'usableWordCueRanges')
        + 'this.ranges = normalizedCueTextRanges;',
    context
);
vm.runInContext(
    sourceFunction('cueEndTicks', 'smoothWordProgress')
        + 'this.cueEndTicks = cueEndTicks;',
    context
);

const withSpace = context.ranges([
    { Position: 0, Start: 50_050_000 },
    { Position: 9, Start: 54_490_000 },
    { Position: 10, Start: 65_270_000 }
], 16);
assert.deepEqual(
    Array.from(withSpace, range => [range.startPosition, range.endPosition]),
    [[0, 9], [9, 10], [10, 16]],
    'A boundary before whitespace stays a whitespace-only cue'
);
assert.equal(
    context.cueEndTicks(0, 0, { Start: 50_050_000 }, [
        { Position: 0, Start: 50_050_000 },
        { Position: 9, Start: 54_490_000 },
        { Position: 10, Start: 65_270_000 }
    ]),
    54_490_000,
    'The empty boundary ends the preceding visible word'
);

const noSpace = context.ranges([
    { Position: 0, Start: 10_000_000 },
    { Position: 1, Start: 13_500_000 },
    { Position: 1, Start: 18_000_000 },
    { Position: 2, Start: 21_000_000 }
], 2);
assert.deepEqual(
    Array.from(noSpace, range => [range.startPosition, range.endPosition]),
    [[0, 1], [1, 2]],
    'A same-position empty boundary does not claim the following word'
);
assert.equal(
    context.cueEndTicks(0, 0, { Start: 10_000_000 }, [
        { Position: 0, Start: 10_000_000 },
        { Position: 1, Start: 13_500_000 },
        { Position: 1, Start: 18_000_000 }
    ]),
    13_500_000,
    'The same-position boundary also ends a compact-script cue'
);

assert(!source.includes('[ak:ends='), 'No visible endpoint transport token remains in the frontend');
console.log('Empty ELRC boundary regression checks passed.');
