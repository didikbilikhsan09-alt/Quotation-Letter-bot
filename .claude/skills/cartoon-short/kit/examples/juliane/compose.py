# captions (word by word, like the reference) + date/age overlays on the rendered frames, piped to ffmpeg
import sys, os, subprocess, math
from PIL import Image, ImageDraw, ImageFont
from multiprocessing import Pool
FB='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
W,H,FPS=720,1280,30
import json
_raw=[(w,a,b) for seg in json.load(open('words.json')) for (w,a,b) in seg['words']]
WORDS=[]; i=0
while i<len(_raw):
    w,a,b=_raw[i]; nx=_raw[i+1] if i+1<len(_raw) else None
    if w=='Julian': WORDS.append(('Juliane',a,b))
    elif w=='Capge,': WORDS.append(('Koepcke,',a,b))
    elif w=='satu' and nx and nx[0].startswith('-'): WORDS.append(('satu-satunya',a,nx[2])); i+=1
    elif w=='penuluka,': m=(a+b)/2; WORDS+= [('penuh',a,m),('luka,',m,b)]
    elif w=='di' and nx and nx[0]=='penuhi': WORDS.append(('dipenuhi',a,nx[2])); i+=1
    elif w=='larval': WORDS.append(('larva',a,b))
    elif w=='alat.': WORDS.append(('lalat.',a,b))
    else: WORDS.append((w,a,b))
    i+=1
KEY={'juliane','koepcke','selamat','parasut','petir','hancur','amazon','1971','17','sungai','11','hari','92','ayahnya','pemukiman','sendirian','patah','pesawat','hutan','warga'}
_f={}
def font(s):
    s=max(8,int(s)); _f[s]=_f.get(s) or ImageFont.truetype(FB,s); return _f[s]
def txt(d,x,y,t,size,fill=(255,255,255),stroke=7,anchor='mm'):
    d.text((x,y),t,font=font(size),fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill=(14,10,14))
def overlay(t,f,d):
    if 3.2<=t<6.0: txt(d,W/2,118,'10.000 KAKI',58); txt(d,W/2,176,'± 3.000 METER · TANPA PARASUT',28,(255,214,70),5)
    if 12.0<=t<18.3: txt(d,W/2,118,'HUTAN AMAZON',54); txt(d,W/2,174,'PERU · 1971',32,(255,214,70),5)
    if 46.9<=t<53.7:
        u=min(1,(t-46.9)/6.4); day=1+int(round(10*u)); txt(d,W/2,124,f'HARI {day}',72,stroke=8); txt(d,W/2,190,'MENYUSURI SUNGAI',28,(255,214,70),5)
    if 58.6<=t<63.4:
        txt(d,W/2,124,'92 ORANG',62,stroke=8)
        if t>=61.1: txt(d,W/2,196,'1 SELAMAT',54,(255,214,70),7)
    # caption, one word at a time (reference style)
    cur=None
    for k,(w,s,e) in enumerate(WORDS):
        nxt=WORDS[k+1][1] if k+1<len(WORDS) else e+0.3
        if s<=t<max(e,min(nxt,e+0.25)): cur=(w,s)
    if cur:
        w,s=cur; u=min(1,(t-s)/0.1); sc=0.86+0.14*u; word=w.strip('.,?!'); kc=word.lower() in KEY
        txt(d,W/2,int(H*0.745),word,int(72*sc),(255,214,60) if kc else (255,255,255),9)
def comp(i):
    t=i/FPS
    im=Image.open(f'frames/f{i:04d}.jpg').convert('RGB'); d=ImageDraw.Draw(im); overlay(t,i,d)
    return im.tobytes()
if __name__=='__main__':
    n=int(sys.argv[1]) if len(sys.argv)>1 else 1902
    if len(sys.argv)>2 and sys.argv[2]=='test':
        for i in [30,150,400,700,1000,1300]:
            if os.path.exists(f'frames/f{i:04d}.jpg'): Image.frombytes('RGB',(W,H),comp(i)).save(f'stills/cap_{i}.jpg')
        sys.exit()
    ff=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','mix.wav','-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/juliane_cartoon_720p.mp4'],stdin=subprocess.PIPE)
    with Pool(3) as p:
        for b in p.imap(comp,range(n),chunksize=8): ff.stdin.write(b)
    ff.stdin.close(); ff.wait()
