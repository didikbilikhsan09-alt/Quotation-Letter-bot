# captions (word by word, like the reference) + date/age overlays on the rendered frames, piped to ffmpeg
import sys, os, subprocess, math
from PIL import Image, ImageDraw, ImageFont
from multiprocessing import Pool
FB='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
W,H,FPS=720,1280,30
SEGS=[(0.00,2.78,"Bayangin, lo selamat dari ledakan bom atom."),
(3.16,7.02,"Terus tiga hari kemudian, lo kena bom atom lagi di kota yang berbeda."),
(7.52,10.84,"Ini beneran terjadi sama pria Jepang bernama Tsutomu Yamaguchi."),
(11.42,16.48,"Tanggal 6 Agustus 1945, dia lagi dinas di Hiroshima pas bom pertama meledak."),
(16.92,20.56,"Badannya penuh luka bakar dan gendang telinganya pecah, tapi dia selamat."),
(21.24,26.32,"Besoknya, dia maksain diri pulang naik kereta ke kampung halamannya buat ketemu anak istrinya."),
(27.16,30.84,"Ironisnya, kampung halaman dia itu, Nagasaki."),
(31.44,38.26,"Dan pas tanggal 9 Agustus, bom atom kedua jatuh, tepat di saat dia lagi ceritain kengerian di Hiroshima ke bosnya."),
(38.84,44.38,"Gilanya lagi, dia selamat untuk kedua kalinya, dan hidup sehat sampai umur 93 tahun."),
(45.02,49.28,"Menurut lo, dia ini orang paling sial atau justru paling beruntung di dunia?")]
WORDS=[]
for a,b,txt in SEGS:
    toks=txt.split(); wt=[len(x)+2 for x in toks]; tot=sum(wt); c=a
    for tk,w in zip(toks,wt):
        e=c+(b-a)*w/tot; WORDS.append((tk,c,e)); c=e
KEY={'bom','atom','hiroshima','nagasaki','93','tahun','selamat','sial','beruntung','kedua','1945','agustus','ledakan','meledak','pecah','bakar','kereta'}
_f={}
def font(s):
    s=max(8,int(s)); _f[s]=_f.get(s) or ImageFont.truetype(FB,s); return _f[s]
def txt(d,x,y,t,size,fill=(255,255,255),stroke=7,anchor='mm'):
    d.text((x,y),t,font=font(size),fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill=(14,10,14))
def overlay(t,f,d):
    # titles
    if 11.6<=t<15.7: txt(d,W/2,118,'6 AGUSTUS 1945',50); txt(d,W/2,172,'HIROSHIMA · 08:15 PAGI',30,(255,214,70),5)
    if 21.4<=t<25.4: txt(d,W/2,118,'7 AGUSTUS 1945',50); txt(d,W/2,172,'KERETA PULANG KE NAGASAKI',28,(255,214,70),5)
    if 31.5<=t<34.7: txt(d,W/2,118,'9 AGUSTUS 1945',50); txt(d,W/2,172,'KANTOR · NAGASAKI · 11:02',30,(255,214,70),5)
    if 34.7<=t<38.6: txt(d,W/2,118,'KEDUA KALINYA',58,(255,96,80),8)
    if 42.0<=t<44.9:
        u=min(1,(t-42.0)/2.4); age=int(29+(93-29)*(u*u*(3-2*u))); txt(d,W/2,130,str(age),128,stroke=9); txt(d,W/2,214,'TAHUN',44,(255,214,70),6)
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
    n=int(sys.argv[1]) if len(sys.argv)>1 else 1487
    if len(sys.argv)>2 and sys.argv[2]=='test':
        for i in [30,150,400,700,1000,1300]:
            if os.path.exists(f'frames/f{i:04d}.jpg'): Image.frombytes('RGB',(W,H),comp(i)).save(f'stills/cap_{i}.jpg')
        sys.exit()
    ff=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','mix.wav','-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/yamaguchi_cartoon_720p.mp4'],stdin=subprocess.PIPE)
    with Pool(3) as p:
        for b in p.imap(comp,range(n),chunksize=8): ff.stdin.write(b)
    ff.stdin.close(); ff.wait()
