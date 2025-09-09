import {TILE, DIRS, clamp} from '../utils.js';

export class Pacman {
  constructor(x,y){
    this.x = x; this.y = y;
    this.dir = 'left';
    this.nextDir = 'left';
    this.speed = 0.09; // tiles per tick
    this.mouth = 0; // 0..1
    this.alive = true;
    this.lives = 3;
    this.score = 0;
  }
  setDirection(d){ this.nextDir = d; }
  update(grid, dt){
    if (!this.alive) return;
    const cx = Math.round(this.x); const cy = Math.round(this.y);
    const centered = Math.abs(this.x-cx)<0.05 && Math.abs(this.y-cy)<0.05;
    if (centered){
      if (canMove(grid, cx, cy, this.nextDir)) this.dir = this.nextDir;
      if (!canMove(grid, cx, cy, this.dir)) return;
      this.x = cx; this.y = cy;
    }
    const v = DIRS[this.dir];
    this.x += v[0]*this.speed*dt;
    this.y += v[1]*this.speed*dt;
    if (this.x < -1) this.x = 28;
    if (this.x > 29) this.x = 0;
    this.mouth += 0.15*dt; if (this.mouth>Math.PI*2) this.mouth=0;
  }
  draw(ctx){
    const px = this.x*TILE + TILE/2;
    const py = this.y*TILE + TILE/2;
    const open = (Math.sin(this.mouth)+1)/2;
    const angle = {right:0, left:Math.PI, up:-Math.PI/2, down:Math.PI/2}[this.dir] || 0;
    ctx.fillStyle = '#ffd200';
    ctx.beginPath();
    const m = 0.35*open*Math.PI;
    ctx.moveTo(px,py);
    ctx.arc(px,py,TILE*0.6, angle+m, angle-m, false);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#111';
    const ex = px + Math.cos(angle - Math.PI/2)*3;
    const ey = py + Math.sin(angle - Math.PI/2)*3;
    ctx.beginPath(); ctx.arc(ex,ey,2,0,Math.PI*2); ctx.fill();
  }
}

function canMove(grid, x,y,dir){
  const d = DIRS[dir] || [0,0];
  const nx = x + d[0]; const ny = y + d[1];
  const row = grid[ny]; if (!row) return false;
  const cell = row[(nx+28)%28];
  return cell !== 0 && cell !== 4;
}
