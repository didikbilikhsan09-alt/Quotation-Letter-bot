# Word timings for the voiceover:  python3 transcribe.py voice.wav [lang=id]  ->  words.json + printed segments
# Needs faster-whisper (pip) and, the first time, network to huggingface.co, cas-server.xethub.hf.co, us.aws.cdn.hf.co.
import sys, subprocess, json, numpy as np
from faster_whisper import WhisperModel
src = sys.argv[1]; lang = sys.argv[2] if len(sys.argv) > 2 else "id"
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ar', '16000', '-ac', '1', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768   # pass samples, not the path (PyAV in this env rejects metadata_errors)
segs, info = WhisperModel("small", compute_type="int8").transcribe(a, word_timestamps=True, language=lang)
out = []
for s in segs:
    print(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
    out.append({'start': s.start, 'end': s.end, 'text': s.text, 'words': [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for w in s.words]})
json.dump(out, open('words.json', 'w'), ensure_ascii=False)
print('duration', round(len(a) / 16000, 2), 's  frames', round(len(a) / 16000 * 30))
