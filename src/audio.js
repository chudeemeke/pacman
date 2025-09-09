// Lightweight WebAudio synth for beeps (no asset files)
export class AudioFX {
  constructor(){ this.enabled = true; this.ctx = null; }
  toggle(){
    this.enabled = !this.enabled;
    return this.enabled;
  }
  _ctx(){
    if (!this.ctx) this.ctx = new (window.AudioContext||window.webkitAudioContext)();
    return this.ctx;
  }
  tone(freq=440, dur=0.08, type='sine', gain=0.05){
    if (!this.enabled) return;
    const ctx = this._ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    o.start(now);
    o.stop(now+dur);
  }
  eat(){ this.tone(880,0.05,'square',0.03); }
  power(){ this.tone(220,0.25,'sawtooth',0.04); }
  death(){ this.tone(110,0.5,'triangle',0.06); }
  start(){ this.tone(660,0.2,'sine',0.05); setTimeout(()=>this.tone(780,0.2,'sine',0.05), 220); }
}
