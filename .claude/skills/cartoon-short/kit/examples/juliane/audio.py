import numpy as np, wave
SR=44100; D=63.4; N=int(SR*D); rng=np.random.default_rng(7)
sfx=np.zeros(N); music=np.zeros(N); t=np.arange(N)/SR
def add(buf,a,x,g=1.0):
    i=int(a*SR)
    if 0<=i<N: x=x[:N-i]; buf[i:i+len(x)]+=x*g
def lp(x,fc):  # fft one-pole-ish lowpass
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X/= (1+(fr/fc)**2)**0.5; return np.fft.irfft(X,len(x))
def bp(x,lo,hi): X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X*=((fr>lo)&(fr<hi)); return np.fft.irfft(X,len(x))
def noise(d): return rng.standard_normal(int(d*SR))
def env(n,a,r): e=np.ones(n); ai=int(a*SR); ri=int(r*SR); e[:ai]=np.linspace(0,1,ai) if ai else 1; e[-ri:]=np.linspace(1,0,ri) if ri else 1; return e
def thump(f=50,d=1.2,g=1): tt=np.arange(int(d*SR))/SR; return np.sin(2*np.pi*(f+16*np.exp(-tt*9))*tt)*np.exp(-tt*4.5)*g
def wind(d,g=1): x=lp(noise(d),500); x/=np.abs(x).max(); return x*env(len(x),d*0.3,d*0.4)*g
def rumble(d): x=lp(noise(d),160); x/=np.abs(x).max(); tt=np.arange(len(x))/SR; return x*np.exp(-tt*1.4)*(1-np.exp(-tt*30))
def swish(d=0.45): x=lp(noise(d),1800); x/=np.abs(x).max(); return x*np.sin(np.pi*np.arange(len(x))/len(x))**3*0.5
def leaves(d): x=bp(noise(d),1500,6000); x/=np.abs(x).max(); tt=np.arange(len(x))/SR; return x*np.exp(-tt*3)*0.6
def chirp(f0): d=0.12; tt=np.arange(int(d*SR))/SR; return np.sin(2*np.pi*(f0+f0*0.5*tt/d)*tt)*np.sin(np.pi*tt/d)*0.25
def chime(f,d=2.2): tt=np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*tt)+0.3*np.sin(4*np.pi*f*tt))*np.exp(-tt*2)*0.35
# music: soft pads per section
def pad(fr,a,b,g,fade=1.5):
    e=np.clip(np.minimum((t-a)/fade,(b-t)/fade),0,1); x=sum(np.sin(2*np.pi*f*t+0.4*np.sin(0.13*t+f)) for f in fr)/len(fr); return x*e*g
music+=pad([110,164.8,220,261.6],0,18.6,0.5)+pad([98,146.8,196,233.1],18.6,31.2,0.55,1.0)+pad([73.4,110,146.8,174.6],31.2,46.6,0.5)
music+=pad([87.3,130.8,174.6,220],46.6,53.8,0.5)+pad([130.8,196,261.6,329.6],53.8,58.4,0.55,0.8)+pad([110,164.8,220,277.2],58.4,63.4,0.5,0.8)
# sfx cues
add(sfx,0.0,wind(6.2),0.7); add(sfx,22.8,wind(3.6),0.7); add(sfx,26.1,wind(2.8),0.6)
add(sfx,20.8,thump(42,1.6)+np.pad(rumble(3.0),(0,0))[:int(1.6*SR)]*0,1.0); add(sfx,20.85,rumble(3.0),0.8)
add(sfx,21.4,thump(55,1.0),0.8)
add(sfx,28.9,thump(60,0.8),0.8); add(sfx,28.9,leaves(1.4),0.9); add(sfx,29.7,thump(48,0.9),0.9)
for a in (6.0,8.9,11.7,18.4,22.8,26.1,29.3,31.1,33.8,39.6,42.2,46.6,49.0,51.0,52.4,53.7,58.3): add(sfx,a-0.15,swish(),0.45)
water=lp(noise(D),900); water/=np.abs(water).max()
we=np.clip(np.minimum((t-39.6)/1.5,(58.3-t)/1.5),0,1); sfx+=water*we*0.18
r=np.random.default_rng(3)
for a in np.arange(6.5,58,1.7):
    if 18.4<a<31.1: continue
    if r.random()<0.7: add(sfx,a+r.random()*0.8,chirp(2400+r.random()*1600),0.5); add(sfx,a+0.2+r.random()*0.6,chirp(2800+r.random()*1200),0.4)
add(sfx,7.9,chime(659.25,2.0),0.45); add(sfx,55.1,chime(523.25,2.4),0.5); add(sfx,55.22,chime(659.25,2.4),0.4); add(sfx,55.34,chime(783.99,2.4),0.4)
add(sfx,61.3,chime(392,3.0),0.45); add(sfx,61.42,chime(587.3,3.0),0.35)
def wr(n,x):
    x=np.tanh(x*0.9); p=(np.stack([x,x],1)*30000).astype(np.int16); w=wave.open(n,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(p.tobytes()); w.close()
wr('music.wav',music*0.1); wr('sfx.wav',sfx); print('stems ok')
