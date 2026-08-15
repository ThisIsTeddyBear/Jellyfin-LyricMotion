#!/usr/bin/env node
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadRomanizer(file) {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return context.window.JellyfinLyricRomanizer;
}
function editDistance(a,b){
  a=Array.from(a||''); b=Array.from(b||'');
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i];
    for(let j=1;j<=b.length;j++) cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    prev=cur;
  }
  return prev[b.length];
}
function styleNormalize(x){return String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/aa/g,'a').replace(/ee/g,'i').replace(/oo/g,'u').replace(/([bcdfghjklmnpqrstvwxyz])\1+/g,'$1').replace(/[^a-z0-9]+/g,'');}
function normalizePlain(x){return String(x||'').toLowerCase().replace(/[^a-z]+/g,'');}
function classify(expected, actual, r){
  if(r.containsNativeScript(actual)) return 'native-residue';
  if(expected===actual) return 'exact';
  if(styleNormalize(expected)===styleNormalize(actual)) return 'style-variant';
  const noLong=x=>String(x).replace(/aa/g,'a').replace(/ee/g,'i').replace(/oo/g,'u');
  if(noLong(expected)===noLong(actual)) return 'vowel-length';
  const noGem=x=>String(x).replace(/([bcdfghjklmnpqrstvwxyz])\1+/g,'$1');
  if(noGem(expected)===noGem(actual)) return 'gemination';
  const noAsp=x=>normalizePlain(x).replace(/kh/g,'k').replace(/gh/g,'g').replace(/chh/g,'ch').replace(/jh/g,'j').replace(/th/g,'t').replace(/dh/g,'d').replace(/ph/g,'p').replace(/bh/g,'b');
  if(noAsp(expected)===noAsp(actual)) return 'aspiration';
  const noVoice=x=>normalizePlain(x).replace(/g/g,'k').replace(/d/g,'t').replace(/b/g,'p').replace(/j/g,'c');
  if(noVoice(expected)===noVoice(actual)) return 'voicing';
  const noNasal=x=>normalizePlain(x).replace(/ng|nj|ny|nn|mm/g,'n').replace(/m/g,'n');
  if(noNasal(expected)===noNasal(actual)) return 'nasal-realization';
  const noSchwa=x=>normalizePlain(x).replace(/a/g,'');
  if(noSchwa(expected)===noSchwa(actual)) return 'schwa-or-implicit-vowel';
  return 'other';
}
const inputFile=process.argv[2];
if(!inputFile){console.error('Usage: node scripts/evaluate-lyricg2p65.js <corpus.tsv> [report.json]');process.exit(2);}
const root=path.resolve(__dirname,'..');
const r=loadRomanizer(path.join(root,'src','jellyfin-lyric-romanizer.js'));
const lines=fs.readFileSync(inputFile,'utf8').split(/\r?\n/).filter(Boolean);
const rows=[];
for(const line of lines){
  if(/^language\t/i.test(line)) continue;
  const [language,native,refsRaw,source=''] = line.split('\t');
  if(!native||!refsRaw) continue;
  const refs=refsRaw.split('||').map(x=>x.trim()).filter(Boolean);
  const actual=r.romanize(native);
  const best=Math.min(...refs.map(ref=>editDistance(ref,actual)));
  const refLen=Math.max(1,Math.min(...refs.map(ref=>Array.from(ref).length)));
  const exact=refs.includes(actual);
  const variants=r.romanizationVariants(native,3).map(x=>x.text);
  const top3=refs.some(ref=>variants.includes(ref));
  const style=refs.some(ref=>styleNormalize(ref)===styleNormalize(actual));
  const category=classify(refs[0],actual,r);
  rows.push({language,native,actual,references:refs,source,exact,top3,styleNormalized:style,editDistance:best,refLen,category});
}
const groups=new Map();
for(const row of rows){
  const g=groups.get(row.language)||{n:0,exact:0,top3:0,style:0,edits:0,chars:0,categories:{}};
  g.n++; if(row.exact)g.exact++; if(row.top3)g.top3++; if(row.styleNormalized)g.style++;
  g.edits+=row.editDistance; g.chars+=row.refLen; g.categories[row.category]=(g.categories[row.category]||0)+1; groups.set(row.language,g);
}
function summarize(g){return {count:g.n,exactAccuracy:+(g.exact/g.n).toFixed(4),top3Accuracy:+(g.top3/g.n).toFixed(4),styleNormalizedAccuracy:+(g.style/g.n).toFixed(4),cer:+(g.edits/Math.max(1,g.chars)).toFixed(4),errorTaxonomy:g.categories};}
const total={n:0,exact:0,top3:0,style:0,edits:0,chars:0,categories:{}};
for(const row of rows){total.n++;if(row.exact)total.exact++;if(row.top3)total.top3++;if(row.styleNormalized)total.style++;total.edits+=row.editDistance;total.chars+=row.refLen;total.categories[row.category]=(total.categories[row.category]||0)+1;}
const report={engine:r.version,style:r.romanizationStyle.id,generatedAt:new Date().toISOString(),corpus:path.basename(inputFile),overall:summarize(total),byLanguage:Object.fromEntries([...groups].map(([k,v])=>[k,summarize(v)])),failures:rows.filter(x=>!x.exact).slice(0,200)};
const out=process.argv[3];
if(out)fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
