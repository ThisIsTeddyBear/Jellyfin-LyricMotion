#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),{performance}=require('perf_hooks');
const context={window:{},console};vm.createContext(context);
const file=path.join(__dirname,'..','src','jellyfin-lyric-romanizer.js');
const t0=performance.now();vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});const loadMs=performance.now()-t0;
const r=context.window.JellyfinLyricRomanizer;
const lines=[
  'നീ എന്റെ ഹൃദയം പോലെ baby', 'காதல் என் உயிரே love நீதான்', 'ప్రేమ మనసులో వెలుగై ఉంది',
  'ನಿನ್ನ ಪ್ರೀತಿ ನನ್ನ ಹೃದಯದಲ್ಲಿ ಇದೆ', 'ਤੇਰਾ ਪਿਆਰ ਮੇਰੇ ਦਿਲ ਵਿੱਚ ਹੈ', 'दिल में तेरा प्यार है',
  'माझं प्रेम तुझ्यासाठी आहे', 'मेरो मन तिम्रो लागि छ'
];
for(let i=0;i<20;i++)for(const line of lines)r.romanize(line);
function bench(fn,rounds){const start=performance.now();let chars=0;for(let n=0;n<rounds;n++)for(const line of lines){fn(line);chars+=line.length;}const ms=performance.now()-start;return {rounds:rounds*lines.length,ms:+ms.toFixed(3),avgMs:+(ms/(rounds*lines.length)).toFixed(5),charsPerSecond:Math.round(chars/(ms/1000))};}
const report={engine:r.version,node:process.version,loadMs:+loadMs.toFixed(3),romanize:bench(x=>r.romanize(x),500),detailed:bench(x=>r.romanizeDetailed(x),50),fallbackEntries:r.fallbackEntries};
console.log(JSON.stringify(report,null,2));
