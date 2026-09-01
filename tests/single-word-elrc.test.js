const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync(
    require('path').join(__dirname, '..', 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);
const start = source.indexOf('function hasTrustedSingleWordCueSweep');
const end = source.indexOf('function hasUsableWordTiming', start);
assert(start >= 0 && end > start, 'single-word ELRC eligibility helper must exist');

const context = {
    finiteTick(value) {
        return Number.isFinite(value) ? value : null;
    },
    cueValue(cue, pascal, camel) {
        return cue && cue[pascal] !== undefined ? cue[pascal] : cue && cue[camel];
    }
};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}this.singleWordSweep = hasTrustedSingleWordCueSweep;`, context);

const cue = { Start: 539510000, Position: 0, EndPosition: 5 };
assert.strictEqual(
    context.singleWordSweep({
        text: 'Mitwa',
        cue,
        cueIndex: 0,
        cues: [cue, { Start: 586280000, Position: 5 }],
        lineEnd: null
    }),
    true,
    'a single word followed by the converter terminal cue must sweep'
);
assert.strictEqual(
    context.singleWordSweep({
        text: 'Mitwa',
        cue: { Start: 539510000, End: 586280000 },
        cueIndex: 0,
        cues: [],
        lineEnd: null
    }),
    true,
    'an explicit cue end must make a single word sweep'
);
assert.strictEqual(
    context.singleWordSweep({
        text: 'This is a complete sentence',
        cue: { Start: 10000000, End: 30000000 },
        cueIndex: 0,
        cues: [],
        lineEnd: null
    }),
    false,
    'a whole timed sentence must remain line-synchronised'
);
