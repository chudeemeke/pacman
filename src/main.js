import {WIDTH, HEIGHT} from './utils.js';
import {Game} from './game.js';
import {Input} from './input.js';
import {AudioFX} from './audio.js';
import {setupPWA} from './pwa.js';

const canvas = document.getElementById('game');
canvas.width = WIDTH; canvas.height = HEIGHT;

const audio = new AudioFX();
const input = new Input();

const ui = {
  input,
  scoreEl: document.getElementById('score'),
  levelEl: document.getElementById('level'),
  livesEl: document.getElementById('lives'),
  toast: document.getElementById('toast')
};

const game = new Game(canvas, audio, ui);
let last = performance.now();

function loop(t){
  const dt = Math.min(50, t - last);
  last = t;
  game.update(dt);
  game.draw();
  ui.scoreEl.textContent = game.pac.score;
  ui.livesEl.textContent = game.pac.lives;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.getElementById('resetBtn').addEventListener('click', ()=>{
  game.levelIndex = 0; game.pac.lives = 3; game.pac.score = 0; game.resetLevel();
});

document.getElementById('muteBtn').addEventListener('click', (e)=>{
  const on = audio.toggle();
  e.currentTarget.textContent = on ? '🔊 Sound' : '🔇 Muted';
});

document.getElementById('actB').addEventListener('click', ()=> game.togglePause());
document.getElementById('actA').addEventListener('click', ()=>{
  for (const g of game.ghosts) g.setFrightened();
});

setupPWA();
