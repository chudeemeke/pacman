import {TILE, DIRS, manhattan, eq} from '../utils.js';
import {isGate} from '../level.js';

const COLORS = { blinky:'#ff4b4b', pinky:'#ff97ce', inky:'#55e1ff', clyde:'#ffb74d', frightened:'#2dd4bf' };

export class Ghost {
  constructor(name, x,y, scatterTarget){
    this.name = name;
    this.x = x; this.y = y;
    this.dir = 'left';
    this.speed = 0.085;
    this.mode = 'scatter';
    this.timer = 0;
    this.scatterTarget = scatterTarget;
  }
  setFrightened(){ if (this.mode!=='eyes'){ this.mode = 'frightened'; this.timer = 600; } }
  killed(){ this.mode = 'eyes'; this.speed = 0.12; }
  update(grid, dt, player, ghosts){
    this.timer -= dt;
    if (this.mode==='scatter' && this.timer<=0) { this.mode='chase'; this.timer=1200; }
    else if (this.mode==='chase' && this.timer<=0){ this.mode='scatter'; this.timer=600; }
    else if (this.mode==='frightened' && this.timer<=0){ this.mode='chase'; this.timer=1200; }

    const cx = Math.round(this.x), cy = Math.round(this.y);
    const centered = Math.abs(this.x-cx)<0.05 && Math.abs(this.y-cy)<0.05;
    if (centered){
      const target = this._target(player, ghosts);
      const options = ['up','left','down','right'];
      const opposite = {up:'down', down:'up', left:'right', right:'left'}[this.dir];
      let best = this.dir, bestDist = 1e9;
      for (const d of options){
        if (this.mode!=='frightened' && d===opposite) continue;
        const v = DIRS[d], nx = (cx+v[0]+28)%28, ny = cy+v[1];
        const row = grid[ny]; if (!row) continue;
        const cell = row[nx];
        if (cell===0) continue;
        if (cell===4 && this.mode!=='eyes') continue;
        const dist = manhattan([nx,ny], target);
        if (dist < bestDist) { bestDist = dist; best = d; }
      }
      this.dir = best;
      this.x = cx; this.y = cy;
    }
    const v = DIRS[this.dir] || [0,0];
    const speed = (this.mode==='frightened') ? this.speed*0.6 : this.speed;
    this.x += v[0]*speed*dt;
    this.y += v[1]*speed*dt;
    if (this.x < -1) this.x = 28;
    if (this.x > 29) this.x = 0;
    if (this.mode==='eyes' && cy===14 && (cx>=12 && cx<=15)) {
      this.mode = 'scatter'; this.speed = 0.085;
    }
  }
  _target(player, ghosts){
    if (this.mode==='frightened'){
      return [ (this.x|0)+ (Math.random()<0.5?-3:3), (this.y|0)+ (Math.random()<0.5?-3:3) ];
    }
    if (this.mode==='eyes'){
      return [13,14];
    }
    const P = [player.x|0, player.y|0];
    switch(this.name){
      case 'blinky': return P;
      case 'pinky':  return [P[0]+4, P[1]-4];
      case 'inky':   {
        const blinky = ghosts.find(g=>g.name==='blinky');
        const vec = [P[0]*2 - (blinky?.x|0), P[1]*2 - (blinky?.y|0)];
        return vec;
      }
      case 'clyde': {
        const d = manhattan([this.x|0,this.y|0], P);
        return d>8 ? P : this.scatterTarget;
      }
      default: return this.scatterTarget;
    }
  }
  draw(ctx){
    const px = this.x*TILE + TILE/2;
    const py = this.y*TILE + TILE/2;
    const color = (this.mode==='frightened') ? COLORS.frightened :
      {blinky:COLORS.blinky, pinky:COLORS.pinky, inky:COLORS.inky, clyde:COLORS.clyde}[this.name] || '#fff';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px-TILE*0.55, py);
    ctx.quadraticCurveTo(px, py-TILE*0.9, px+TILE*0.55, py);
    ctx.lineTo(px+TILE*0.55, py+TILE*0.55);
    ctx.lineTo(px-TILE*0.55, py+TILE*0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px-4, py-2, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+4, py-2, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0b1b34';
    const dx = {left:-1,right:1,up:0,down:0}[this.dir]||0;
    const dy = {up:-1,down:1,left:0,right:0}[this.dir]||0;
    ctx.beginPath(); ctx.arc(px-4+dx, py-2+dy, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+4+dx, py-2+dy, 1.5, 0, Math.PI*2); ctx.fill();
  }
}
