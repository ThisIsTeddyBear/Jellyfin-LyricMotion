#!/usr/bin/env python3
"""Prepare leakage-resistant LyricG2P train/dev/test TSVs.

Input TSV header should include: language, native, romanized.
Optional columns: source, artist, song, lemma, origin.
Rows sharing a normalized native token, song, or (with --artist-isolation) artist
are unioned into the same component before deterministic splitting.
"""
import argparse, csv, hashlib, unicodedata
from collections import defaultdict
from pathlib import Path

class DSU:
    def __init__(self,n): self.p=list(range(n))
    def find(self,x):
        while self.p[x]!=x:
            self.p[x]=self.p[self.p[x]];x=self.p[x]
        return x
    def union(self,a,b):
        a,b=self.find(a),self.find(b)
        if a!=b:self.p[b]=a

def norm(s): return unicodedata.normalize('NFC',(s or '').strip())
def keyhash(s): return int(hashlib.sha256(s.encode('utf-8')).hexdigest()[:16],16)/float(0xFFFFFFFFFFFFFFFF)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('input_tsv'); ap.add_argument('output_dir')
    ap.add_argument('--dev',type=float,default=.10); ap.add_argument('--test',type=float,default=.10)
    ap.add_argument('--artist-isolation',action='store_true')
    args=ap.parse_args()
    if not (0 <= args.dev < 1) or not (0 <= args.test < 1) or args.dev + args.test >= 1:
        ap.error('--dev and --test must be in [0,1) and sum to less than 1')
    with open(args.input_tsv,encoding='utf-8',newline='') as f: rows=list(csv.DictReader(f,delimiter='\t'))
    rows=[r for r in rows if norm(r.get('language')) and norm(r.get('native')) and norm(r.get('romanized'))]
    for r in rows:
        r['native']=norm(r.get('native')); r['romanized']=norm(r.get('romanized')); r['language']=norm(r.get('language'))
    dsu=DSU(len(rows)); indexes=defaultdict(list)
    for i,r in enumerate(rows):
        indexes[('native',r['language'],r['native'])].append(i)
        if norm(r.get('song')): indexes[('song',norm(r.get('artist')),norm(r.get('song')))].append(i)
        if norm(r.get('lemma')): indexes[('lemma',r['language'],norm(r.get('lemma')))].append(i)
        if args.artist_isolation and norm(r.get('artist')): indexes[('artist',norm(r.get('artist')))].append(i)
    for ids in indexes.values():
        for i in ids[1:]: dsu.union(ids[0],i)
    comps=defaultdict(list)
    for i,r in enumerate(rows): comps[dsu.find(i)].append(i)
    assignment={}
    for root,ids in comps.items():
        signature='|'.join(sorted(f"{rows[i]['language']}:{rows[i]['native']}:{norm(rows[i].get('song'))}" for i in ids))
        v=keyhash(signature)
        assignment[root]='test' if v<args.test else ('dev' if v<args.test+args.dev else 'train')
    out=Path(args.output_dir);out.mkdir(parents=True,exist_ok=True)
    fields=list(rows[0].keys()) if rows else ['language','native','romanized']
    counts={x:0 for x in ('train','dev','test')}
    files={}
    try:
        writers={}
        for split in counts:
            fh=open(out/f'{split}.tsv','w',encoding='utf-8',newline='');files[split]=fh
            writers[split]=csv.DictWriter(fh,fieldnames=fields,delimiter='\t',lineterminator='\n');writers[split].writeheader()
        for i,r in enumerate(rows):
            split=assignment[dsu.find(i)];writers[split].writerow(r);counts[split]+=1
    finally:
        for fh in files.values(): fh.close()
    print({'rows':len(rows),'components':len(comps),'splits':counts,'artistIsolation':args.artist_isolation})
if __name__=='__main__': main()
