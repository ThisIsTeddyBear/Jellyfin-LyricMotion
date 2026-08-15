#!/usr/bin/env python3
"""Convert Dakshina sampled transliteration lexicons to LyricG2P evaluator TSV.
Data is not bundled. Point this at an extracted Dakshina release directory.
"""
import argparse, csv, json, unicodedata
from pathlib import Path
LANGS={'hi':'hi','mr':'mr','bn':'bn','gu':'gu','pa':'pa','ta':'ta','te':'te','kn':'kn','ml':'ml','ur':'ur','sd':'sd','si':'si'}
def main():
    ap=argparse.ArgumentParser();ap.add_argument('dakshina_root');ap.add_argument('output_tsv');ap.add_argument('--split',default='test',choices=['train','dev','test']);args=ap.parse_args()
    root=Path(args.dakshina_root); patterns=[f'*.translit.sampled.{args.split}.tsv',f'*.translit.{args.split}.tsv']
    files=[]
    for pat in patterns: files.extend(root.rglob(pat))
    files=sorted(set(files)); grouped={}
    for f in files:
        lang=next((part for part in f.parts if part in LANGS),None) or f.name.split('.')[0]
        if lang not in LANGS: continue
        with f.open(encoding='utf-8') as fh:
            for line in fh:
                parts=line.rstrip('\n').split('\t')
                if len(parts)<2: continue
                native=unicodedata.normalize('NFC',parts[0].strip())
                roman=unicodedata.normalize('NFC',parts[1].strip())
                if not native or not roman: continue
                try: count=int(parts[2]) if len(parts)>2 else 1
                except ValueError: count=1
                if count <= 0: count=1
                key=(LANGS[lang],native);grouped.setdefault(key,{})
                grouped[key][roman]=grouped[key].get(roman,0)+count
    with open(args.output_tsv,'w',encoding='utf-8',newline='') as out:
        w=csv.writer(out,delimiter='\t',lineterminator='\n');w.writerow(['language','native','references','referenceCounts','source'])
        for (lang,native),refcounts in sorted(grouped.items()):
            refs=sorted(refcounts,key=lambda x:(-refcounts[x],x))
            w.writerow([lang,native,'||'.join(refs),json.dumps({r:refcounts[r] for r in refs},ensure_ascii=False,separators=(',',':')),f'dakshina-{args.split}'])
    print({'files':len(files),'wordTypes':len(grouped),'output':args.output_tsv})
if __name__=='__main__':main()
