#!/usr/bin/env python3
"""Research-only tiny native-script -> Roman candidate model for LyricG2P.

The source and target vocabularies are deliberately separate. Native-script
symbols can therefore never be decoded as Roman output. This tool is not a
runtime dependency. A checkpoint may be bundled only after it beats the
shipping deterministic engine on leakage-safe held-out song/public data.
"""
from __future__ import annotations
import argparse, csv, json, math, random, time
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

PAD, BOS, EOS, UNK = '<pad>', '<bos>', '<eos>', '<unk>'
SPECIAL=[PAD,BOS,EOS,UNK]

def edit_distance(a: str, b: str) -> int:
    prev=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        cur=[i]
        for j,cb in enumerate(b,1):
            cur.append(min(cur[-1]+1,prev[j]+1,prev[j-1]+(ca!=cb)))
        prev=cur
    return prev[-1]

def read_rows(path: str):
    rows=[]
    with open(path,encoding='utf-8',newline='') as f:
        for r in csv.DictReader(f,delimiter='\t'):
            native=(r.get('native') or '').strip()
            roman=(r.get('romanized') or r.get('references') or '').split('||')[0].strip()
            lang=(r.get('language') or 'unknown').strip()
            if native and roman: rows.append((lang,native,roman))
    return rows

class Vocab:
    def __init__(self, rows):
        langs=sorted({lang for lang,_,_ in rows})
        src_chars=sorted({ch for _,src,_ in rows for ch in src})
        tgt_chars=sorted({ch for _,_,tgt in rows for ch in tgt})
        self.src_itos=SPECIAL+[f'<lang:{x}>' for x in langs]+[x for x in src_chars if x not in SPECIAL]
        self.tgt_itos=SPECIAL+[x for x in tgt_chars if x not in SPECIAL]
        self.src_stoi={x:i for i,x in enumerate(self.src_itos)}
        self.tgt_stoi={x:i for i,x in enumerate(self.tgt_itos)}
    def sid(self,x): return self.src_stoi.get(x,self.src_stoi[UNK])
    def tid(self,x): return self.tgt_stoi.get(x,self.tgt_stoi[UNK])
    def encode_src(self,lang,text): return [self.sid(BOS),self.sid(f'<lang:{lang}>')]+[self.sid(c) for c in text]+[self.sid(EOS)]
    def encode_tgt(self,text): return [self.tid(BOS)]+[self.tid(c) for c in text]+[self.tid(EOS)]
    def decode_tgt(self,ids):
        out=[]
        for i in ids:
            tok=self.tgt_itos[int(i)]
            if tok==EOS: break
            if tok in SPECIAL: continue
            out.append(tok)
        return ''.join(out)

class Pairs(Dataset):
    def __init__(self,rows,vocab): self.rows=rows;self.v=vocab
    def __len__(self): return len(self.rows)
    def __getitem__(self,i):
        lang,src,tgt=self.rows[i]
        return torch.tensor(self.v.encode_src(lang,src)),torch.tensor(self.v.encode_tgt(tgt)),(lang,src,tgt)

def collate(batch):
    srcs,tgts,meta=zip(*batch)
    return (nn.utils.rnn.pad_sequence(srcs,batch_first=True,padding_value=0),
            nn.utils.rnn.pad_sequence(tgts,batch_first=True,padding_value=0),meta)

class TinyTransformer(nn.Module):
    def __init__(self,src_vocab,tgt_vocab,d_model=96,nhead=4,layers=2,ff=256,dropout=.1,max_len=160):
        super().__init__();self.d_model=d_model
        self.src_emb=nn.Embedding(src_vocab,d_model,padding_idx=0)
        self.tgt_emb=nn.Embedding(tgt_vocab,d_model,padding_idx=0)
        self.src_pos=nn.Embedding(max_len,d_model);self.tgt_pos=nn.Embedding(max_len,d_model)
        self.tr=nn.Transformer(d_model=d_model,nhead=nhead,num_encoder_layers=layers,num_decoder_layers=layers,
                               dim_feedforward=ff,dropout=dropout,batch_first=True,norm_first=True)
        self.out=nn.Linear(d_model,tgt_vocab)
    def add_pos(self,x,emb,pos):
        p=torch.arange(x.size(1),device=x.device).unsqueeze(0)
        return emb(x)*math.sqrt(self.d_model)+pos(p)
    def encode(self,src):
        pad=src.eq(0);h=self.add_pos(src,self.src_emb,self.src_pos)
        return self.tr.encoder(h,src_key_padding_mask=pad),pad
    def decode_logits(self,tgt,memory,src_pad):
        n=tgt.size(1);mask=torch.triu(torch.ones(n,n,device=tgt.device,dtype=torch.bool),diagonal=1)
        h=self.add_pos(tgt,self.tgt_emb,self.tgt_pos)
        out=self.tr.decoder(h,memory,tgt_mask=mask,tgt_key_padding_mask=tgt.eq(0),memory_key_padding_mask=src_pad)
        return self.out(out)
    def forward(self,src,tgt_in):
        memory,pad=self.encode(src);return self.decode_logits(tgt_in,memory,pad)

@torch.inference_mode()
def greedy(model,v,lang,src_text,device,max_len=80):
    src=torch.tensor([v.encode_src(lang,src_text)],device=device)
    memory,pad=model.encode(src);ys=torch.tensor([[v.tid(BOS)]],device=device)
    for _ in range(max_len):
        nxt=model.decode_logits(ys,memory,pad)[:,-1,:].argmax(-1,keepdim=True)
        ys=torch.cat([ys,nxt],1)
        if int(nxt.item())==v.tid(EOS): break
    return v.decode_tgt(ys[0].tolist())

def evaluate(model,v,rows,device,limit=0):
    model.eval();work=rows[:limit] if limit else rows;exact=edits=chars=0;fail=[]
    for lang,src,ref in work:
        pred=greedy(model,v,lang,src,device,max_len=max(32,len(ref)*3+8))
        exact+=pred==ref;edits+=edit_distance(pred,ref);chars+=max(1,len(ref))
        if pred!=ref and len(fail)<50: fail.append({'language':lang,'native':src,'reference':ref,'predicted':pred})
    n=max(1,len(work));return {'count':len(work),'exactAccuracy':exact/n,'cer':edits/max(1,chars),'failures':fail}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('train_tsv');ap.add_argument('dev_tsv');ap.add_argument('output_dir')
    ap.add_argument('--epochs',type=int,default=20);ap.add_argument('--batch-size',type=int,default=128)
    ap.add_argument('--d-model',type=int,default=96);ap.add_argument('--layers',type=int,default=2);ap.add_argument('--ff',type=int,default=256)
    ap.add_argument('--lr',type=float,default=2e-3);ap.add_argument('--seed',type=int,default=6500);ap.add_argument('--device',default='cpu')
    args=ap.parse_args();random.seed(args.seed);torch.manual_seed(args.seed)
    train=read_rows(args.train_tsv);dev=read_rows(args.dev_tsv)
    if not train or not dev: raise SystemExit('train/dev TSVs must both contain rows')
    v=Vocab(train+dev);device=torch.device(args.device)
    model=TinyTransformer(len(v.src_itos),len(v.tgt_itos),args.d_model,4,args.layers,args.ff).to(device)
    opt=torch.optim.AdamW(model.parameters(),lr=args.lr,weight_decay=.01)
    loss_fn=nn.CrossEntropyLoss(ignore_index=0,label_smoothing=.03)
    dl=DataLoader(Pairs(train,v),batch_size=args.batch_size,shuffle=True,collate_fn=collate)
    out=Path(args.output_dir);out.mkdir(parents=True,exist_ok=True);best=None;history=[];start=time.time()
    for epoch in range(1,args.epochs+1):
        model.train();total=steps=0
        for src,tgt,_ in dl:
            src,tgt=src.to(device),tgt.to(device);opt.zero_grad(set_to_none=True)
            logits=model(src,tgt[:,:-1]);loss=loss_fn(logits.reshape(-1,logits.size(-1)),tgt[:,1:].reshape(-1));loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(),1.0);opt.step();total+=float(loss.item());steps+=1
        metrics=evaluate(model,v,dev,device);rec={'epoch':epoch,'trainLoss':total/max(1,steps),'devExact':metrics['exactAccuracy'],'devCER':metrics['cer']};history.append(rec);print(json.dumps(rec))
        score=(metrics['exactAccuracy'],-metrics['cer'])
        if best is None or score>best[0]:
            best=(score,epoch,metrics)
            torch.save({'model':model.state_dict(),'srcVocab':v.src_itos,'tgtVocab':v.tgt_itos,'config':vars(args),'epoch':epoch},out/'tiny-transformer.pt')
    params=sum(p.numel() for p in model.parameters())
    report={'researchOnly':True,'bundlingApproved':False,'trainRows':len(train),'devRows':len(dev),'sourceVocabSize':len(v.src_itos),'targetVocabSize':len(v.tgt_itos),'parameters':params,'bestEpoch':best[1],'bestDev':best[2],'history':history,'elapsedSeconds':time.time()-start}
    (out/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (out/'source-vocab.json').write_text(json.dumps(v.src_itos,ensure_ascii=False)+'\n',encoding='utf-8')
    (out/'target-vocab.json').write_text(json.dumps(v.tgt_itos,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2,ensure_ascii=False))
if __name__=='__main__':main()
