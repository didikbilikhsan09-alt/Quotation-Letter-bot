# mix: voice unchanged; music = 50% of voice gated RMS; sfx = 50% with peaks capped at 0.7x voice peak (kit rule)
import numpy as np, wave, subprocess, sys
def rd(p):
    out=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar','48000','-'],capture_output=True).stdout
    return np.frombuffer(out,np.float32).reshape(-1,2)
v=rd(sys.argv[1]); m=rd('music.wav'); s=rd('sfx.wav')
n=len(v); m=np.pad(m,((0,max(0,n-len(m))),(0,0)))[:n]; s=np.pad(s,((0,max(0,n-len(s))),(0,0)))[:n]
def grms(x):
    w=48000//10; r=np.sqrt((x[:len(x)//w*w].reshape(-1,w,2)**2).mean((1,2))); g=r[r>0.25*r.max()]; return float(np.sqrt((g**2).mean()))
vr,vp=grms(v),np.abs(v).max()
m=m*(0.5*vr/max(grms(m),1e-9)); s=s*(0.5*vr/max(grms(s),1e-9))
if np.abs(s).max()>0.7*vp: s=s*(0.7*vp/np.abs(s).max())
mix=v+m+s; print('voice rms',vr,'music',grms(m)/vr,'sfx',grms(s)/vr,'peak',np.abs(mix).max())
mix=mix/max(1.0,np.abs(mix).max()/0.98)
out=(mix*32000).astype(np.int16); w=wave.open('mix_raw.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(out.tobytes()); w.close()
