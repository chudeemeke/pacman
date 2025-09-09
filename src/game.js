import {TILE, WIDTH, HEIGHT, DIRS} from './utils.js';
import {parseLevel, LEVELS, isWall, isGate} from './level.js';
import {Pacman} from './entities/pacman.js';
import {Ghost} from './entities/ghost.js';

export class Game {
  constructor(canvas, audio, ui){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.ui = ui;
    this.levelIndex = 0;
    this.state = 'ready';
    this.resetLevel();
  }
  resetLevel(){
    const {grid, pellets, powers} = parseLevel(LEVELS[this.levelIndex]);
    this.grid = grid; this.pellets = pellets; this.powers = powers;
    this.pac = new Pacman(14,23);
    this.ghosts = [
      new Ghost('blinky', 13, 11, [27,0]),
      new Ghost('pinky', 14, 14, [0,0]),
      new Ghost('inky', 12, 14, [27,30]),
      new Ghost('clyde', 15, 14, [0,30]),
    ];
    this.state = 'ready';
    this.flashTimer = 180;
    this.last = performance.now();
    this.audio.start();
  }
  togglePause(){ this.state = this.state==='paused' ? 'playing' : 'paused'; }
  update(dt){
    if (this.state==='over' || this.state==='paused') return;
    if (this.state==='ready'){ this.flashTimer -= dt; if (this.flashTimer<=0) this.state='playing'; return; }

    this.pac.setDirection(this.ui.input.dir);

    this.pac.update(this.grid, dt);
    for (const g of this.ghosts) g.update(this.grid, dt, this.pac, this.ghosts);

    const key = `${Math.round(this.pac.x)},${Math.round(this.pac.y)}`;
    if (this.pellets.delete(key)){ this.pac.score += 10; this.audio.eat(); }
    if (this.powers.delete(key)){ this.pac.score += 50; this.audio.power(); for (const g of this.ghosts) g.setFrightened(); }

    for (const g of this.ghosts){
      const sameTile = Math.abs(g.x - this.pac.x)<0.5 && Math.abs(g.y - this.pac.y)<0.5;
      if (!sameTile) continue;
      if (g.mode==='frightened'){
        g.killed(); this.pac.score += 200;
      } else if (g.mode!=='eyes'){
        this.pac.lives -= 1; this.audio.death();
        if (this.pac.lives<=0){ this.state='over'; }
        else this.resetLevel();
        return;
      }
    }

    if (this.pellets.size===0){
      this.levelIndex = (this.levelIndex+1) % LEVELS.length;
      this.resetLevel();
      this.pac.lives = Math.min(this.pac.lives+1, 5);
    }
  }
  draw(){
    const ctx = this.ctx;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    ctx.fillStyle = '#0a0c18';
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    this.drawMaze(ctx);
    this.drawPellets(ctx);
    this.pac.draw(ctx);
    for (const g of this.ghosts) g.draw(ctx);
    if (this.state==='ready'){
      this.banner('READY!');
    } else if (this.state==='over'){
      this.banner('GAME OVER');
    } else if (this.state==='paused'){
      this.banner('PAUSED');
    }
  }
  banner(text){
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, WIDTH/2, HEIGHT/2);
  }
  drawMaze(ctx){
    ctx.strokeStyle = '#2a335c';
    ctx.lineWidth = 2;
    for (let y=0; y<this.grid.length; y++){
      for (let x=0; x<this.grid[y].length; x++){
        if (this.grid[y][x]===0){
          ctx.strokeRect(x*TILE+1, y*TILE+1, TILE-2, TILE-2);
        }
      }
    }
    ctx.fillStyle = '#3f4a7a';
    for (let y=0; y<this.grid.length; y++){
      for (let x=0; x<this.grid[y].length; x++){
        if (this.grid[y][x]===4){
          ctx.fillRect(x*TILE+4, y*TILE+7, TILE-8, 2);
        }
      }
    }
  }
  drawPellets(ctx){
    ctx.fillStyle = '#cdd3ea';
    for (const key of this.pellets){
      const [x,y] = key.split(',').map(Number);
      const cx = x*TILE + TILE/2;
      const cy = y*TILE + TILE/2;
      ctx.beginPath(); ctx.arc(cx,cy,2,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = '#ffd766';
    for (const key of this.powers){
      const [x,y] = key.split(',').map(Number);
      const cx = x*TILE + TILE/2;
      const cy = y*TILE + TILE/2;
      ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
    }
  }
}
