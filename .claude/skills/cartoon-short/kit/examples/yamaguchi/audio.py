import numpy as np, wave
SR=44100; D=49.6; N=int(SR*D); rng=np.random.default_rng(11)
buf=np.zeros(N); music=np.zeros(N)
def add(a,x,g=1.0):
    i=int(a*SR)
    if i<0 or i>=N: return
    x=x[:N-i]; buf[i:i+len(x)]+=x*g
def lpf(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
def thump(f=52,dur=0.9,g=1.0):
    t=np.arange(int(dur*SR))/SR; return np.sin(2*np.pi*(f+14*np.exp(-t*9))*t)*np.exp(-t*5.5)*g
def swish(dur=0.45):
    t=np.arange(int(dur*SR))/SR; n=rng.standard_normal(len(t)); env=np.sin(np.pi*t/dur)**3
    return lpf(n,1800)*env*0.5
def tick():
    t=np.arange(int(0.04*SR))/SR; return np.sin(2*np.pi*1800*t)*np.exp(-t*90)*0.5
def chime(f,dur=2.2):
    t=np.arange(int(dur*SR))/SR; return (np.sin(2*np.pi*f*t)+0.3*np.sin(2*np.pi*2*f*t))*np.exp(-t*2.0)*0.35
t=np.arange(N)/SR
def pad(freqs,a,b,g,fade=1.5):
    env=np.clip(np.minimum((t-a)/fade,(b-t)/fade),0,1)
    x=sum(np.sin(2*np.pi*f*t+0.4*np.sin(0.13*t+f)) for f in freqs)/len(freqs)
    return x*env*g
bed=pad([110,164.8,220,277.2],0,31.3,0.5,2.5)+pad([98,146.8,196,233],31.3,38.8,0.5,1.2)+pad([130.8,196,261.6,329.6],38.8,44.9,0.55,1.2)+pad([110,164.8,220,261.6],44.9,49.6,0.5,0.8)
music+=bed*0.10
for a in (1.3,5.3,15.9,34.7): add(a,thump(48,1.4,0.9))
for a in (3.1,7.5,11.4,16.9,21.2,27.1,31.3,38.8,44.9): add(a-0.15,swish(),0.5)
for a in (3.3,4.0,4.65): add(a,tick()*1.5)
for k in np.arange(31.6,34.6,0.5): add(k,tick(),0.6)
for k in np.arange(21.5,25.4,0.3): add(k,lpf(rng.standard_normal(int(0.1*SR)),900)*np.exp(-np.arange(int(0.1*SR))/SR*30)*1.4,0.35)
add(7.6,thump(60,0.5,0.6))
for k,a in enumerate((16.5,)): pass
add(19.8,chime(784,2.0),0.5); add(40.0,chime(523.25,2.4),0.5); add(40.12,chime(659.25,2.4),0.4); add(40.24,chime(783.99,2.4),0.4)
add(44.2,chime(659.25,1.8),0.35)
def wr(name,x):
    x=np.tanh(x*0.9); pcm=(np.stack([x,x],1)*30000).astype(np.int16)
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
wr('music.wav',music); wr('sfx.wav',buf); print('stems ok')
